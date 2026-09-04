import { HouseScore, ResultItem, Stage, GalleryItem, VideoHighlight, SmilePhoto, HeroMedia, ParticipantProfile } from '../types';

export const INSTITUTION = {
  name: "Noorul Islam Madrasa",
  tagline: "Jeppu, Mangalore",
  eventTitle: "At-Tabassum Meelad Fest 2026",
  subTitle: "A smile that brings hearts together",
  theme: "A smile that brings hearts together",
  dates: "September 05 2026",
  location: "MAS Garden, Jeppu",
  email: "zenith.theorganizer@gmail.com",
  phone: "+91 74831 38340",
  socials: {
    instagram: "https://instagram.com/zeni.th.in",
    youtube: "https://At-Tabassum.hashlay.in",
    facebook: "https://At-Tabassum.hashlay.in"
  }
};

export const DEFAULT_HERO_MEDIA: HeroMedia[] = [
  { id: 'hm-1', type: 'image', url: '/hero1.jpg', title: 'Inaugural Session', caption: 'At-Tabassum Meelad Fest' },
  { id: 'hm-2', type: 'image', url: '/hero2.jpg', title: 'Festival Scholars', caption: 'At-Tabassum Meelad Fest' }
];

export const NO_DP_AVATAR = "data:image/svg+xml;charset=UTF-8,%3Csvg%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%2224%22%20height%3D%2224%22%20rx%3D%2212%22%20fill%3D%22%23D1D5DB%22%2F%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%228.5%22%20r%3D%224.5%22%20fill%3D%22white%22%2F%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20d%3D%22M12%2014.5C8.36%2014.5%205%2016.59%205%2019.5V20C6.7%2021.6%209.2%2022.5%2012%2022.5C14.8%2022.5%2017.3%2021.6%2019%2020V19.5C19%2016.59%2015.64%2014.5%2012%2014.5Z%22%20fill%3D%22white%22%2F%3E%3C%2Fsvg%3E";

export const DEMO_PARTICIPANTS: ParticipantProfile[] = [];

export const HOUSE_SCORES: HouseScore[] = [];

export const RESULTS_DATA: ResultItem[] = [];

export const STAGES_DATA: Stage[] = [
  {
    id: 'stage-1',
    name: 'Main Stage — Grand Auditorium',
    location: 'Central Campus Lawn',
    streamUrl: '',
    videoEmbedId: '',
    isLive: false,
    currentProgram: '',
    nextProgram: '',
    schedule: []
  },
  {
    id: 'stage-2',
    name: 'Stage 2 — Literary Arena',
    location: 'Imam Rabbani Block B',
    streamUrl: '',
    videoEmbedId: '',
    isLive: false,
    currentProgram: '',
    nextProgram: '',
    schedule: []
  }
];

export const GALLERY_DATA: GalleryItem[] = [];

export const VIDEO_HIGHLIGHTS: VideoHighlight[] = [];

export const SMILE_PHOTOS: SmilePhoto[] = [];

export const FULL_CONCEPT_TEXT = {
  title: "A SMILE THAT BRINGS HEART TOGETHER",
  institution: "Noorul Islam Madrasa",
  badge: "Theme Concept & Philosophy",
  footer: "At-Tabassum Meelad Fest",
  paragraphs: [
    "In a time when genuine connections are often lost amid the rush of everyday life, a simple smile carries the power to bring hearts closer.",
    "At-Tabassum Meelad Fest 2026 celebrates the spirit of togetherness, compassion, creativity, and shared learning. It creates a vibrant space for young minds to discover their talents, strengthen friendships, embrace meaningful values, and grow through healthy competition.",
    "Beyond a celebration of talent, At-Tabassum is a reminder that kindness connects people, knowledge inspires growth, and a smile can bring hearts together."
  ]
};
