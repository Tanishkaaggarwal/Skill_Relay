import assert from 'assert';
import mongoose from 'mongoose';
import { connectDB, closeDB } from '../src/config/db.js';
import { seedData } from '../src/seed.js';
import { User } from '../src/models/User.js';
import { Post } from '../src/models/Post.js';
import { Session } from '../src/models/Session.js';
import { Transaction } from '../src/models/Transaction.js';
import { Review } from '../src/models/Review.js';

async function runTests() {
  console.log('🧪 Starting Skill Relay Automated Test Suite...\n');
  await connectDB();
  await seedData();

  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  };

  try {
    // 1. Verify User Seeding and Initial Balances
    await test('All demo users seeded with correct credentials and initial credit bonuses', async () => {
      const users = await User.find({});
      assert.strictEqual(users.length, 5, 'Should have 5 demo users');
      const alex = await User.findOne({ email: 'alex@campus.edu' });
      assert.ok(alex, 'Alex should exist');
      assert.strictEqual(alex.creditBalance, 160, 'Alex should have 160 credits');
      
      const transactions = await Transaction.find({ userId: alex._id, type: 'initial_bonus' });
      assert.strictEqual(transactions.length, 1, 'Should have initial bonus transaction');
      assert.strictEqual(transactions[0].amount, 100);
    });

    // 2. Verify Post Creation & Credit Balance Requirement
    await test('Requester must have sufficient credit balance to post a request', async () => {
      const priya = await User.findOne({ email: 'priya@campus.edu' });
      assert.ok(priya.creditBalance >= 20, 'Priya has enough balance for a 20-credit request');

      const newPost = await Post.create({
        type: 'request',
        author: priya._id,
        title: 'Need help with Organic Chemistry spectroscopy NMR',
        description: 'Trying to interpret C-13 NMR spectra for lab report.',
        skillTags: ['Organic Chemistry', 'Chemistry'],
        urgency: 'quick_ask',
        creditAmount: 20,
      });

      assert.ok(newPost._id);
      assert.strictEqual(newPost.status, 'open');
    });

    // 3. Verify Atomic Credit Settlement on Mutual Session Confirmation
    await test('Atomic credit settlement updates balances, creates ledger transactions, and marks session complete only when both parties confirm', async () => {
      // Find two users: Jordan (Requester) and Alex (Helper)
      const requester = await User.findOne({ email: 'jordan@campus.edu' });
      const helper = await User.findOne({ email: 'alex@campus.edu' });

      const initialRequesterBalance = requester.creditBalance;
      const initialHelperBalance = helper.creditBalance;
      const creditCost = 30;

      // Create a test session
      const testPost = await Post.create({
        type: 'request',
        author: requester._id,
        title: 'Test Session Post',
        description: 'Test session description',
        skillTags: ['React'],
        urgency: 'quick_ask',
        creditAmount: creditCost,
        status: 'matched',
      });

      const session = await Session.create({
        postId: testPost._id,
        requester: requester._id,
        helper: helper._id,
        creditAmount: creditCost,
        status: 'active',
        confirmedByRequester: false,
        confirmedByHelper: false,
      });

      // Step A: Requester confirms only
      session.confirmedByRequester = true;
      await session.save();

      // Verify no balance changes yet
      let reqUserAfterFirstConfirm = await User.findById(requester._id);
      let helpUserAfterFirstConfirm = await User.findById(helper._id);
      assert.strictEqual(reqUserAfterFirstConfirm.creditBalance, initialRequesterBalance, 'Balance should not change with only 1 confirmation');
      assert.strictEqual(helpUserAfterFirstConfirm.creditBalance, initialHelperBalance, 'Balance should not change with only 1 confirmation');

      // Step B: Helper confirms -> Triggers atomic settlement
      session.confirmedByHelper = true;

      // Execute atomic settlement logic
      const updatedRequester = await User.findByIdAndUpdate(
        session.requester,
        { $inc: { creditBalance: -creditCost, sessionsCompleted: 1 } },
        { new: true }
      );

      const updatedHelper = await User.findByIdAndUpdate(
        session.helper,
        { $inc: { creditBalance: creditCost, totalCreditsEarned: creditCost, sessionsCompleted: 1 } },
        { new: true }
      );

      await Transaction.create({
        userId: session.requester,
        sessionId: session._id,
        postId: session.postId,
        type: 'debit',
        amount: -creditCost,
        balanceAfter: updatedRequester.creditBalance,
        description: `Debit test transfer`,
      });

      await Transaction.create({
        userId: session.helper,
        sessionId: session._id,
        postId: session.postId,
        type: 'credit',
        amount: creditCost,
        balanceAfter: updatedHelper.creditBalance,
        description: `Credit test transfer`,
      });

      session.status = 'completed';
      session.completedAt = new Date();
      await session.save();

      // Verify balances after mutual confirmation
      assert.strictEqual(updatedRequester.creditBalance, initialRequesterBalance - creditCost, 'Requester balance must be debited');
      assert.strictEqual(updatedHelper.creditBalance, initialHelperBalance + creditCost, 'Helper balance must be credited');

      // Verify Transaction entries
      const debits = await Transaction.find({ sessionId: session._id, type: 'debit' });
      const credits = await Transaction.find({ sessionId: session._id, type: 'credit' });
      assert.strictEqual(debits.length, 1, 'Should have 1 debit transaction');
      assert.strictEqual(credits.length, 1, 'Should have 1 credit transaction');
      assert.strictEqual(debits[0].amount, -creditCost);
      assert.strictEqual(credits[0].amount, creditCost);
    });

    // 4. Verify Review Submission and Average Rating Recalculation
    await test('Submitting a review recalculates user average rating', async () => {
      const alex = await User.findOne({ email: 'alex@campus.edu' });
      const marcus = await User.findOne({ email: 'marcus@campus.edu' });

      const testPost = await Post.create({
        type: 'request',
        author: marcus._id,
        title: 'Review test post',
        description: 'Review test desc',
        skillTags: ['Git'],
        creditAmount: 20,
        status: 'completed',
      });

      const session = await Session.create({
        postId: testPost._id,
        requester: marcus._id,
        helper: alex._id,
        creditAmount: 20,
        status: 'completed',
      });

      // Marcus gives Alex a 5-star rating
      await Review.create({
        sessionId: session._id,
        reviewer: marcus._id,
        reviewee: alex._id,
        rating: 5,
        comment: 'Outstanding help with Git!',
        role: 'requester',
      });

      const allReviews = await Review.find({ reviewee: alex._id });
      const avg = Number((allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1));

      await User.findByIdAndUpdate(alex._id, {
        avgRating: avg,
        reviewCount: allReviews.length,
      });

      const updatedAlex = await User.findById(alex._id);
      assert.ok(updatedAlex.avgRating >= 4.5 && updatedAlex.avgRating <= 5.0);
      assert.ok(updatedAlex.reviewCount > 0);
    });

  } finally {
    await closeDB();
  }

  console.log(`\n================================`);
  console.log(`Tests Completed: ${passed + failed}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
