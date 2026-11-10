export interface OcrSample {
  id: string;
  title: string;
  unit: string;
  description: string;
  sampleText: string;
  thumbnailEmoji: string;
}

export const SAMPLE_OCR_PAGES: OcrSample[] = [
  {
    id: 'sample-u1',
    title: 'Unit 1: Getting Started - Leisure Activities',
    unit: 'Unit 1: Leisure Time',
    thumbnailEmoji: '🎨',
    description: 'Trang mở đầu SGK Tiếng Anh 8 Global Success (Page 8 - NXB GDVN)',
    sampleText: `UNIT 1: LEISURE TIME
GETTING STARTED: What do you like doing in your free time?
Trang: Hi Mai, what are you doing?
Mai: I'm folding origami. My brother bought me a lovely craft kit with lots of colorful paper.
Trang: Wow, that looks creative! I adore making DIY paper crafts too.
Mai: Do you want to hang out this Saturday? We can practice folding paper cranes together.
Trang: I'd love to! But in the morning I detest doing chores, so let's meet in the afternoon.`,
  },
  {
    id: 'sample-u2',
    title: 'Unit 2: A Closer Look 1 - Life in the Countryside',
    unit: 'Unit 2: Life in the Countryside',
    thumbnailEmoji: '🌾',
    description: 'Bảng từ vựng và bài đọc trang 18 SGK Global Success 8',
    sampleText: `UNIT 2: LIFE IN THE COUNTRYSIDE
Vocabulary & Reading:
Life in rural areas has changed significantly. During the harvest season, local farmers work tirelessly from dawn to dusk. They cultivate vast paddy fields and herd cattle along the scenic riverbanks. The atmosphere is picturesque and peaceful, making visitors feel relaxed after days in bustling cities.`,
  },
  {
    id: 'sample-u7',
    title: 'Unit 7: Communication - Environmental Protection',
    unit: 'Unit 7: Environmental Protection',
    thumbnailEmoji: '🌿',
    description: 'Bài thảo luận bảo vệ môi trường trang 74 SGK Global Success 8',
    sampleText: `UNIT 7: ENVIRONMENTAL PROTECTION
Project: Green Living in Our School
To preserve local biodiversity, students should avoid single-use plastics such as straws, bags, and disposable cups. Every student can reduce their personal carbon footprint by cycling to school and planting trees in the school garden. Protecting ecosystems starts from our smallest daily habits!`,
  },
  {
    id: 'sample-u11',
    title: 'Unit 11: Skills 1 - Science and Technology',
    unit: 'Unit 11: Science and Technology',
    thumbnailEmoji: '🤖',
    description: 'Bài đọc công nghệ tương lai trang 118 SGK Global Success 8',
    sampleText: `UNIT 11: SCIENCE AND TECHNOLOGY
Reading: Technological Breakthroughs
Scientists predict that biometric scanners and artificial intelligence will revolutionize daily security. In medical science, nanotechnology allows doctors to target cancer cells without damaging healthy tissues. These innovations will certainly reshape our future society.`,
  },
];
