import mysql from 'mysql2/promise';

const SECTIONS = [
  {
    title: 'Start Here',
    slug: 'start-here',
    description: 'Foundation practices and introduction to the Kaula path',
    iconName: 'Compass',
    sortOrder: 1,
    parentId: null,
  },
  {
    title: 'Teaching of the Path',
    slug: 'teaching-of-the-path',
    description: 'Core philosophy and foundational teachings of Kashmir Shaivism',
    iconName: 'BookOpen',
    sortOrder: 2,
    parentId: null,
  },
  {
    title: '112 Yuktis',
    slug: '112-yuktis',
    description: 'Practices from the Vijnanabhairava Tantra',
    iconName: 'Sparkles',
    sortOrder: 3,
    parentId: null,
  },
  {
    title: 'Visualizations',
    slug: 'visualizations',
    description: 'Guided inner work and visualization practices',
    iconName: 'Eye',
    sortOrder: 4,
    parentId: null,
  },
  {
    title: 'Live Practices',
    slug: 'live-practices',
    description: 'Deferred live sessions and group practices',
    iconName: 'Video',
    sortOrder: 5,
    parentId: null,
  },
  {
    title: 'Resources',
    slug: 'resources',
    description: 'Books, texts, and additional materials',
    iconName: 'FolderOpen',
    sortOrder: 6,
    parentId: null,
  },
];

const VIDEOS = [
  {
    title: 'Welcome to Kaula School',
    slug: 'welcome-to-kaula-school',
    description: 'An introduction to the Kaula School and what to expect from this journey.',
    sectionSlug: 'start-here',
    googleDriveFileId: null,
    durationSeconds: 600,
    subtitleFileUrl: null,
    sortOrder: 1,
  },
  {
    title: 'Introduction to Kashmir Shaivism',
    slug: 'intro-to-shaivism',
    description: 'Understanding the non-dual philosophy of Kashmir Shaivism and its practical applications.',
    sectionSlug: 'teaching-of-the-path',
    googleDriveFileId: null,
    durationSeconds: 1200,
    subtitleFileUrl: null,
    sortOrder: 1,
  },
  {
    title: 'The Kaula Approach',
    slug: 'kaula-approach',
    description: 'Exploring the unique Kaula perspective on spiritual practice and daily life integration.',
    sectionSlug: 'teaching-of-the-path',
    googleDriveFileId: null,
    durationSeconds: 900,
    subtitleFileUrl: null,
    sortOrder: 2,
  },
  {
    title: 'Yukti 1: Breath Awareness',
    slug: 'yukti-1-breath',
    description: 'The first practice from the Vijnanabhairava Tantra focusing on breath awareness.',
    sectionSlug: '112-yuktis',
    googleDriveFileId: null,
    durationSeconds: 450,
    subtitleFileUrl: null,
    sortOrder: 1,
  },
  {
    title: 'Yukti 2: Sound Meditation',
    slug: 'yukti-2-sound',
    description: 'Using the vibration of sound as a gateway to non-dual awareness.',
    sectionSlug: '112-yuktis',
    googleDriveFileId: null,
    durationSeconds: 480,
    subtitleFileUrl: null,
    sortOrder: 2,
  },
  {
    title: 'Guided Visualization: The Inner Light',
    slug: 'visualization-inner-light',
    description: 'A guided practice to connect with the inner light and luminosity of consciousness.',
    sectionSlug: 'visualizations',
    googleDriveFileId: null,
    durationSeconds: 1080,
    subtitleFileUrl: null,
    sortOrder: 1,
  },
  {
    title: 'Guided Visualization: The Heart Center',
    slug: 'visualization-heart',
    description: 'Exploring the heart center as the seat of consciousness and devotion.',
    sectionSlug: 'visualizations',
    googleDriveFileId: null,
    durationSeconds: 960,
    subtitleFileUrl: null,
    sortOrder: 2,
  },
];

async function seedCourses() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    console.log('🌱 Seeding course sections...');
    
    // Insert sections
    for (const section of SECTIONS) {
      const [existing] = await connection.execute(
        'SELECT id FROM sections WHERE slug = ?',
        [section.slug]
      );
      
      if (existing.length > 0) {
        console.log(`  ✓ Section "${section.title}" already exists`);
        continue;
      }
      
      await connection.execute(
        `INSERT INTO sections (title, slug, description, iconName, sortOrder, parentId, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [section.title, section.slug, section.description, section.iconName, section.sortOrder, section.parentId]
      );
      console.log(`  ✓ Created section: "${section.title}"`);
    }
    
    console.log('\n🎬 Seeding sample videos...');
    
    // Insert videos
    for (const video of VIDEOS) {
      const [sectionResult] = await connection.execute(
        'SELECT id FROM sections WHERE slug = ?',
        [video.sectionSlug]
      );
      
      if (sectionResult.length === 0) {
        console.log(`  ✗ Section "${video.sectionSlug}" not found for video "${video.title}"`);
        continue;
      }
      
      const sectionId = sectionResult[0].id;
      
      const [existing] = await connection.execute(
        'SELECT id FROM videos WHERE slug = ?',
        [video.slug]
      );
      
      if (existing.length > 0) {
        console.log(`  ✓ Video "${video.title}" already exists`);
        continue;
      }
      
      await connection.execute(
        `INSERT INTO videos (title, slug, description, sectionId, googleDriveFileId, durationSeconds, subtitleUrl, sortOrder, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [video.title, video.slug, video.description, sectionId, video.googleDriveFileId, video.durationSeconds, video.subtitleFileUrl, video.sortOrder]
      );
      console.log(`  ✓ Created video: "${video.title}"`);
    }
    
    console.log('\n✨ Course seeding complete!');
    console.log('\nNext steps:');
    console.log('1. Log in to the admin panel');
    console.log('2. Go to Videos section');
    console.log('3. Edit each video and add your Google Drive file IDs');
    console.log('4. Optionally add subtitle file URLs');
    
  } catch (error) {
    console.error('✗ Error seeding courses:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seedCourses();
