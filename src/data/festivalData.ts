import { HouseScore, ResultItem, Stage, GalleryItem, VideoHighlight, SmilePhoto, HeroMedia, ParticipantProfile } from '../types';

export const INSTITUTION = {
  name: "Swalahul Huda Academy",
  tagline: "Meelad Fest",
  eventTitle: "FANOUS 2K26",
  subTitle: "Meelad Fest",
  theme: "Meelad Fest",
  dates: "October 9, 2026",
  location: "Rifayiya Juma Masjid Muchila",
  email: "zenith.theorganizer@gmail.com",
  phone: "+91 7483138340",
  socials: {
    instagram: "https://instagram.com",
    youtube: "https://youtube.com",
    facebook: "https://facebook.com"
  }
};

export const DEFAULT_HERO_MEDIA: HeroMedia[] = [
  { id: 'hm-1', type: 'image', url: '/fanous_logo.jpg', title: 'Fanous 2K26', caption: 'Meelad Fest' }
];

export const NO_DP_AVATAR = "data:image/svg+xml;charset=UTF-8,%3Csvg%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%2224%22%20height%3D%2224%22%20rx%3D%2212%22%20fill%3D%22%23D1D5DB%22%2F%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%228.5%22%20r%3D%224.5%22%20fill%3D%22white%22%2F%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20d%3D%22M12%2014.5C8.36%2014.5%205%2016.59%205%2019.5V20C6.7%2021.6%209.2%2022.5%2012%2022.5C14.8%2022.5%2017.3%2021.6%2019%2020V19.5C19%2016.59%2015.64%2014.5%2012%2014.5Z%22%20fill%3D%22white%22%2F%3E%3C%2Fsvg%3E";

export const DEMO_PARTICIPANTS: ParticipantProfile[] = [];

export const HOUSE_SCORES: HouseScore[] = [];

export const RESULTS_DATA: ResultItem[] = [];

export const STAGES_DATA: Stage[] = [
  {
    id: 'stage-1',
    name: 'Main Stage',
    location: 'Rifayiya Juma Masjid Muchila',
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

export const FULL_CONCEPT_TEXT = {
  title: "FANOUS 2K26 — MEELAD FEST",
  institution: "Swalahul Huda Academy • Under Rifayiya Juma Masjid Muchila",
  badge: "Festival Concept & Vision",
  paragraphs: [
    "FANOUS 2K26 is the premier annual arts, literary, and cultural festival presented by Swalahul Huda Academy, functioning under the guidance and management of Rifayiya Juma Masjid Muchila. Commemorating the auspicious occasion of Meelad Fest, FANOUS stands as a radiant beacon of intellectual illumination, spiritual devotion, and artistic excellence.",
    "The festival is designed to nurture and showcase the multidimensional talents of students across diverse artistic, literary, and oratory disciplines. Through rigorous academic competitions, creative writing, elocution, calligraphy, and cultural renditions, participants are inspired to achieve the highest benchmarks of performance and moral integrity.",
    "FANOUS—meaning 'The Lantern of Guidance'—symbolizes the radiant light of knowledge that dispels ignorance. Rooted in traditional Islamic ethics and progressive scholastic aspirations, this grand platform fosters brotherhood, healthy competitive spirit, and collaborative leadership among students.",
    "With comprehensive judging standards, dynamic digital tabulation, and an inspiring celebration of youth potential, FANOUS 2K26 unites students, teachers, and the broader community in a joyous commemoration of love, wisdom, and creative devotion for Meelad Fest."
  ]
};
