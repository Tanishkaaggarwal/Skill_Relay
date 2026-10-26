import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { Post } from './models/Post.js';
import { Session } from './models/Session.js';
import { Transaction } from './models/Transaction.js';
import { Review } from './models/Review.js';
import { Message } from './models/Message.js';
import { Notification } from './models/Notification.js';

dotenv.config();

export const seedData = async () => {
  console.log('🌱 Clearing existing collections...');
  await User.deleteMany({});
  await Post.deleteMany({});
  await Session.deleteMany({});
  await Transaction.deleteMany({});
  await Review.deleteMany({});
  await Message.deleteMany({});
  await Notification.deleteMany({});

  console.log('👥 Creating Demo Students...');
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  const usersData = [
    {
      name: 'Alex Chen',
      email: 'alex@campus.edu',
      password: hashedPassword,
      campus: 'North Campus Engineering',
      major: 'Computer Science (Senior)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'Senior CS student passionate about full-stack dev, algorithms, and helping peers unblock tricky bugs.',
      skillsOffered: ['React', 'Python', 'Data Structures', 'Git', 'TypeScript', 'Node.js'],
      skillsWanted: ['UI/UX', 'Figma', 'Public Speaking', 'Spanish'],
      creditBalance: 160,
      avgRating: 4.9,
      reviewCount: 4,
      sessionsCompleted: 4,
      totalCreditsEarned: 120,
    },
    {
      name: 'Maya Patel',
      email: 'maya@campus.edu',
      password: hashedPassword,
      campus: 'South Campus Arts & Media',
      major: 'Human-Computer Interaction (Junior)',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      bio: 'Design nerd! Love helping students turn rough wireframes into polished Figma prototypes and clean portfolio resumes.',
      skillsOffered: ['Figma', 'UI/UX', 'Resume Review', 'Tailwind CSS', 'User Research'],
      skillsWanted: ['Python', 'Data Science', 'Linear Algebra'],
      creditBalance: 130,
      avgRating: 5.0,
      reviewCount: 3,
      sessionsCompleted: 3,
      totalCreditsEarned: 90,
    },
    {
      name: 'Jordan Reed',
      email: 'jordan@campus.edu',
      password: hashedPassword,
      campus: 'Science Quad',
      major: 'Applied Mathematics & Physics (Junior)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      bio: 'Math tutor and physics TA. Here to make calculus, differential equations, and linear algebra intuitive.',
      skillsOffered: ['Linear Algebra', 'Calculus', 'Statistics', 'MATLAB', 'Physics'],
      skillsWanted: ['React', 'Web Development', 'Resume Review'],
      creditBalance: 110,
      avgRating: 4.8,
      reviewCount: 2,
      sessionsCompleted: 2,
      totalCreditsEarned: 50,
    },
    {
      name: 'Priya Sharma',
      email: 'priya@campus.edu',
      password: hashedPassword,
      campus: 'Health Sciences Wing',
      major: 'Biochemistry / Pre-Med (Sophomore)',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      bio: 'Pre-med student. Happy to review chemistry mechanisms and biology concepts. Always looking for coding help on research scripts.',
      skillsOffered: ['Organic Chemistry', 'Biology', 'Lab Protocols', 'MCAT Prep'],
      skillsWanted: ['Python', 'Statistics', 'Excel'],
      creditBalance: 80,
      avgRating: 5.0,
      reviewCount: 2,
      sessionsCompleted: 2,
      totalCreditsEarned: 40,
    },
    {
      name: 'Marcus Vance',
      email: 'marcus@campus.edu',
      password: hashedPassword,
      campus: 'Business & Management Hall',
      major: 'Business & Entrepreneurship (Sophomore)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      bio: 'Startup enthusiast. I help with pitch decks, public speaking, and conversational Spanish practice.',
      skillsOffered: ['Pitch Decks', 'Public Speaking', 'Spanish', 'Marketing Strategy'],
      skillsWanted: ['Web Development', 'Figma', 'Python'],
      creditBalance: 100,
      avgRating: 4.7,
      reviewCount: 1,
      sessionsCompleted: 1,
      totalCreditsEarned: 20,
    },
  ];

  const createdUsers = await User.insertMany(usersData);
  const [alex, maya, jordan, priya, marcus] = createdUsers;

  console.log('📜 Creating Initial Balance Ledgers...');
  for (const user of createdUsers) {
    await Transaction.create({
      userId: user._id,
      type: 'initial_bonus',
      amount: 100,
      balanceAfter: 100,
      description: 'Welcome Bonus: 100 starting credits to kickstart your campus help exchange!',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    });
  }

  console.log('📌 Creating Request and Offer Posts...');
  const postsData = [
    {
      type: 'request',
      author: priya._id,
      title: 'Need help debugging Python data parsing script for Bio lab',
      description: 'I have a CSV with 5,000 gene sequence readings and my Pandas script keeps crashing with a MemoryError. Need someone to help optimize the generator/chunking logic!',
      skillTags: ['Python', 'Data Science', 'Pandas'],
      urgency: 'quick_ask',
      creditAmount: 20,
      status: 'open',
    },
    {
      type: 'request',
      author: marcus._id,
      title: 'Resume & Portfolio Review for upcoming Tech Startup Fair',
      description: 'Looking for an experienced designer or upperclassman to tear down my 1-page resume and slide deck before Friday career fair.',
      skillTags: ['Resume Review', 'UI/UX', 'Figma'],
      urgency: 'full_session',
      creditAmount: 50,
      status: 'open',
    },
    {
      type: 'request',
      author: alex._id,
      title: 'Practice conversational Spanish before oral final exam',
      description: 'Taking Spanish 201 and need 30 minutes of conversational speaking practice focused on everyday campus situations and past tense.',
      skillTags: ['Spanish', 'Languages'],
      urgency: 'quick_ask',
      creditAmount: 20,
      status: 'open',
    },
    {
      type: 'request',
      author: jordan._id,
      title: 'Help setting up Tailwind CSS & React routing in a new project',
      description: 'Building a personal math visualizer website, need quick guidance getting dynamic routes and clean layout structure wired up.',
      skillTags: ['React', 'Tailwind CSS', 'Web Development'],
      urgency: 'quick_ask',
      creditAmount: 20,
      status: 'open',
    },
    {
      type: 'offer',
      author: alex._id,
      title: 'Offering Git Mastery: Branching, Rebasing, & resolving Merge Conflicts',
      description: 'Can guide you through team git workflows, recovering lost commits, writing clean commit messages, and setting up GitHub Actions.',
      skillTags: ['Git', 'GitHub', 'Software Engineering'],
      urgency: 'quick_ask',
      creditAmount: 20,
      status: 'open',
    },
    {
      type: 'offer',
      author: maya._id,
      title: '1-on-1 Figma Prototyping & Design Systems Coaching',
      description: 'Learn auto-layout, component variables, interactive states, and how to hand off designs cleanly to developers.',
      skillTags: ['Figma', 'UI/UX', 'Design Systems'],
      urgency: 'full_session',
      creditAmount: 50,
      status: 'open',
    },
    {
      type: 'offer',
      author: jordan._id,
      title: 'Linear Algebra & Calculus Exam Prep Tutoring',
      description: 'Stuck on matrix transformations, eigenvalues, or multivariable calculus integrals? I can explain core visual intuition and walk through practice problems.',
      skillTags: ['Linear Algebra', 'Calculus', 'Math'],
      urgency: 'full_session',
      creditAmount: 50,
      status: 'open',
    },
    {
      type: 'offer',
      author: marcus._id,
      title: 'Pitch Deck Coaching & Public Speaking Polish',
      description: 'I will help you structure your slide deck narrative, rehearse your 3-minute pitch, and give actionable body language feedback.',
      skillTags: ['Pitch Decks', 'Public Speaking', 'Presentation'],
      urgency: 'quick_ask',
      creditAmount: 20,
      status: 'open',
    },
  ];

  const createdPosts = await Post.insertMany(postsData);

  console.log('🤝 Creating Completed Sessions, Transactions, & Reviews...');

  // Historical Session 1: Alex (Helper) helped Priya (Requester) with Python
  const pastPost1 = await Post.create({
    type: 'request',
    author: priya._id,
    title: 'Help with Python dictionaries and data cleanup',
    description: 'Needed help formatting lab results into structured JSON arrays.',
    skillTags: ['Python'],
    urgency: 'quick_ask',
    creditAmount: 20,
    status: 'completed',
  });

  const session1 = await Session.create({
    postId: pastPost1._id,
    requester: priya._id,
    helper: alex._id,
    creditAmount: 20,
    status: 'completed',
    confirmedByRequester: true,
    confirmedByHelper: true,
    reviewedByRequester: true,
    reviewedByHelper: true,
    startedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  });

  pastPost1.matchedSession = session1._id;
  await pastPost1.save();

  // Ledger for Session 1
  await Transaction.create({
    userId: priya._id,
    sessionId: session1._id,
    postId: pastPost1._id,
    type: 'debit',
    amount: -20,
    balanceAfter: 80,
    description: `Paid 20 credits to Alex Chen for "Help with Python dictionaries and data cleanup".`,
    createdAt: session1.completedAt,
  });

  await Transaction.create({
    userId: alex._id,
    sessionId: session1._id,
    postId: pastPost1._id,
    type: 'credit',
    amount: 20,
    balanceAfter: 120,
    description: `Earned 20 credits from Priya Sharma for helping with "Help with Python dictionaries and data cleanup".`,
    createdAt: session1.completedAt,
  });

  // Review for Session 1
  await Review.create({
    sessionId: session1._id,
    reviewer: priya._id,
    reviewee: alex._id,
    rating: 5,
    comment: 'Alex was super patient and helped me understand list comprehensions and dictionaries in 20 minutes!',
    role: 'requester',
  });

  // Historical Session 2: Maya (Helper) helped Jordan (Requester) with Figma
  const pastPost2 = await Post.create({
    type: 'request',
    author: jordan._id,
    title: 'Design review for research presentation slides',
    description: 'Wanted feedback on slide layouts and color palettes.',
    skillTags: ['UI/UX', 'Figma'],
    urgency: 'full_session',
    creditAmount: 50,
    status: 'completed',
  });

  const session2 = await Session.create({
    postId: pastPost2._id,
    requester: jordan._id,
    helper: maya._id,
    creditAmount: 50,
    status: 'completed',
    confirmedByRequester: true,
    confirmedByHelper: true,
    reviewedByRequester: true,
    reviewedByHelper: true,
    startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  });

  pastPost2.matchedSession = session2._id;
  await pastPost2.save();

  await Transaction.create({
    userId: jordan._id,
    sessionId: session2._id,
    postId: pastPost2._id,
    type: 'debit',
    amount: -50,
    balanceAfter: 50,
    description: `Paid 50 credits to Maya Patel for "Design review for research presentation slides".`,
    createdAt: session2.completedAt,
  });

  await Transaction.create({
    userId: maya._id,
    sessionId: session2._id,
    postId: pastPost2._id,
    type: 'credit',
    amount: 50,
    balanceAfter: 150,
    description: `Earned 50 credits from Jordan Reed for helping with "Design review for research presentation slides".`,
    createdAt: session2.completedAt,
  });

  await Review.create({
    sessionId: session2._id,
    reviewer: jordan._id,
    reviewee: maya._id,
    rating: 5,
    comment: 'Maya transformed my boring slides into an executive-level deck. 10/10 design mentor.',
    role: 'requester',
  });

  // Active Session ready for demo testing: Alex & Maya
  const activePost = await Post.create({
    type: 'request',
    author: alex._id,
    title: 'Help structuring a mobile design system for campus app',
    description: 'Looking to pair with Maya to refine typography scale and interactive button states.',
    skillTags: ['UI/UX', 'Figma'],
    urgency: 'quick_ask',
    creditAmount: 20,
    status: 'matched',
  });

  const activeSession = await Session.create({
    postId: activePost._id,
    requester: alex._id,
    helper: maya._id,
    creditAmount: 20,
    status: 'active',
    confirmedByRequester: false,
    confirmedByHelper: false,
    startedAt: new Date(),
  });

  activePost.matchedSession = activeSession._id;
  await activePost.save();

  await Message.create({
    sessionId: activeSession._id,
    sender: alex._id,
    content: "Hey Maya! Excited to collaborate on this design system. Let me know when you're free to take a look.",
  });

  await Message.create({
    sessionId: activeSession._id,
    sender: maya._id,
    content: "Hey Alex! I have the Figma file open right now. I left a few initial comments on the color tokens.",
  });

  console.log('✅ Demo Database Seed Completed Successfully!');
};

export const seedDatabaseIfEmpty = async () => {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('⚡ Empty database detected. Auto-seeding realistic campus demo data...');
    await seedData();
  }
};

// If run directly via `node src/seed.js`
if (process.argv[1]?.endsWith('seed.js')) {
  import('./config/db.js').then(async ({ connectDB, closeDB }) => {
    await connectDB();
    await seedData();
    await closeDB();
    process.exit(0);
  });
}
