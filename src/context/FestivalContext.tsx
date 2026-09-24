import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AuthUser,
  UserRole,
  ParticipantProfile,
  HeroMedia,
  ResultItem,
  GalleryItem,
  SmilePhoto,
  Stage,
  VideoHighlight,
  FaceMatchResult,
  Program,
  JudgeProfile,
  MarkEntry,
  HouseScore
} from '../types';
import {
  DEFAULT_HERO_MEDIA,
  RESULTS_DATA,
  GALLERY_DATA,
  SMILE_PHOTOS,
  STAGES_DATA,
  VIDEO_HIGHLIGHTS,
  NO_DP_AVATAR
} from '../data/festivalData';

const STORAGE_KEY = 'festival_cms_data_v2';

interface FestivalContextType {
  // Auth state
  authUser: AuthUser | null;
  loginUnified: (username: string, password?: string) => { success: boolean; error?: string };
  loginUnifiedByChestNo: (chestNo: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  loginInitialTab: 'participant' | 'committee' | 'developer';
  openLoginModal: (tab?: 'participant' | 'committee' | 'developer') => void;

  // Hero Media State (Cycling background)
  heroMedia: HeroMedia[];
  activeHeroIndex: number;
  setActiveHeroIndex: (index: number) => void;
  addHeroMedia: (media: Omit<HeroMedia, 'id'>) => { success: boolean; error?: string };
  removeHeroMedia: (id: string) => void;

  // Dynamic Content Data
  results: ResultItem[];
  addResult: (item: Omit<ResultItem, 'id'>) => void;
  updateResult: (item: ResultItem) => void;
  deleteResult: (id: string) => void;

  gallery: GalleryItem[];
  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => void;

  smilePhotos: SmilePhoto[];
  addSmilePhoto: (photo: Omit<SmilePhoto, 'id'>) => void;

  stages: Stage[];
  updateStage: (stage: Stage) => void;

  videoHighlights: VideoHighlight[];
  addVideoHighlight: (video: Omit<VideoHighlight, 'id'>) => void;

  // AI Face Matcher Engine
  runFaceRecognition: (faceImageDataUrl: string) => FaceMatchResult;
  isFaceScanning: boolean;
  
  // CMS State
  participants: ParticipantProfile[];
  addParticipant: (p: ParticipantProfile) => void;
  updateParticipant: (p: ParticipantProfile) => void;
  deleteParticipant: (codeNumber: string) => void;

  programs: Program[];
  addProgram: (p: Program) => void;
  updateProgram: (p: Program) => void;
  deleteProgram: (id: string) => void;

  judges: JudgeProfile[];
  addJudge: (j: JudgeProfile) => void;
  updateJudge: (j: JudgeProfile) => void;
  deleteJudge: (id: string) => void;

  marks: MarkEntry[];
  addMark: (m: MarkEntry) => void;
  updateMark: (m: MarkEntry) => void;
  deleteMark: (id: string) => void;

  // UI Portals State
  activeModalView: 'none' | 'login' | 'participant-profile' | 'admin-dashboard' | 'face-scanner' | 'judge-dashboard' | 'results-board';
  setActiveModalView: (view: 'none' | 'login' | 'participant-profile' | 'admin-dashboard' | 'face-scanner' | 'judge-dashboard' | 'results-board') => void;
  
  // Dynamic Standings
  houseScores: HouseScore[];

  // Categories from backend
  categories: any[];

  // Event Settings
  eventSettings: any;
}

const FestivalContext = createContext<FestivalContextType | undefined>(undefined);

function safeStorageGet<T>(key: string, fallback: T): T {
  try {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    return parsed !== null && parsed !== undefined ? (parsed as T) : fallback;
  } catch (e) {
    console.warn(`[FestivalContext] Clearing corrupted key "${key}":`, e);
    try { localStorage.removeItem(key); } catch (_) {}
    return fallback;
  }
}

export const FestivalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Auth State
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => safeStorageGet<AuthUser | null>('rendezvous_auth_user', null));

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginInitialTab, setLoginInitialTab] = useState<'participant' | 'committee' | 'developer'>('participant');
  const [activeModalView, setActiveModalView] = useState<'none' | 'login' | 'participant-profile' | 'admin-dashboard' | 'face-scanner' | 'judge-dashboard' | 'results-board'>('none');

  useEffect(() => {
    try {
      if (authUser) {
        localStorage.setItem('rendezvous_auth_user', JSON.stringify(authUser));
      } else {
        localStorage.removeItem('rendezvous_auth_user');
      }
    } catch (_) {}
  }, [authUser]);

  // 2. Hero Background Cycling State (3 second timer)
  const [heroMedia, setHeroMedia] = useState<HeroMedia[]>(() => safeStorageGet<HeroMedia[]>('rendezvous_hero_media_v2', DEFAULT_HERO_MEDIA));

  const [activeHeroIndex, setActiveHeroIndex] = useState<number>(0);

  useEffect(() => {
    try { localStorage.setItem('rendezvous_hero_media_v2', JSON.stringify(heroMedia)); } catch (_) {}
  }, [heroMedia]);

  // Auto 3-second cycle for hero background
  useEffect(() => {
    if (heroMedia.length <= 1) return;
    const interval = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % heroMedia.length);
    }, 3000); // 3 seconds per image/video requirement!

    return () => clearInterval(interval);
  }, [heroMedia]);

  // Purge legacy demo mock data from localStorage once on boot
  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem('rendezvous_auth_user');
      if (storedAuth && (
        storedAuth.includes('Festival Competition') ||
        storedAuth.includes('3012') ||
        storedAuth.includes('3016') ||
        storedAuth.includes('Ajmal') ||
        storedAuth.includes('Tashmeer') ||
        storedAuth.includes('Main Team')
      )) {
        localStorage.removeItem('rendezvous_auth_user');
        setAuthUser(null);
      }
      if (!localStorage.getItem('rendezvous_data_cleaned_v7')) {
        localStorage.removeItem('rendezvous_results_v2');
        localStorage.removeItem('rendezvous_gallery_v2');
        localStorage.removeItem('rendezvous_smile_photos_v2');
        localStorage.removeItem('rendezvous_stages_v2');
        localStorage.removeItem('rendezvous_videos_v2');
        localStorage.removeItem('rendezvous_participants_v2');
        localStorage.removeItem('rendezvous_programs_v2');
        localStorage.removeItem('rendezvous_judges_v2');
        localStorage.removeItem('rendezvous_marks_v2');
        
        setResults([]);
        setGallery([]);
        setSmilePhotos([]);
        setStages([]);
        setVideoHighlights([]);
        setParticipants([]);
        setPrograms([]);
        setJudges([]);
        setMarks([]);
        
        localStorage.setItem('rendezvous_data_cleaned_v7', 'true');
      }
    } catch (_) {}
  }, []);

  // 3. Dynamic Data States
  const [results, setResults] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [smilePhotos, setSmilePhotos] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [videoHighlights, setVideoHighlights] = useState<any[]>([]);
  const [eventSettings, setEventSettings] = useState<any>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [isFaceScanning, setIsFaceScanning] = useState(false);
  const [houseScores, setHouseScores] = useState<HouseScore[]>([]);

  // CMS States
  const [participants, setParticipants] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [judges, setJudges] = useState<any[]>([]);
  const [marks, setMarks] = useState<any[]>([]);

  // Unified Initial Data Fetch (Eliminating Waterfall: All 5 endpoints fetched in parallel)
  useEffect(() => {
    const fetchAllPublicData = async () => {
      try {
        const [resResults, resSettings, resCategories, resStandings, resUnits] = await Promise.all([
          fetch('/api/public/results').then(r => r.ok ? r.json() : []).catch(() => []),
          fetch('/api/public/settings').then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/public/categories').then(r => r.ok ? r.json() : []).catch(() => []),
          fetch('/api/public/standings').then(r => r.ok ? r.json() : []).catch(() => []),
          fetch('/api/public/units').then(r => r.ok ? r.json() : []).catch(() => [])
        ]);

        const rawResults = Array.isArray(resResults) ? resResults : [];
        setResults(rawResults);

        if (resSettings && typeof resSettings === 'object' && Object.keys(resSettings).length > 0) {
          setEventSettings((prev: any) => {
            const merged = { ...prev, ...resSettings };
            if (!resSettings.posterTemplateConfig && prev?.posterTemplateConfig) {
              merged.posterTemplateConfig = prev.posterTemplateConfig;
            }
            return merged;
          });
        }

        if (Array.isArray(resCategories) && resCategories.length > 0) {
          setCategories(resCategories);
        }

        // Immediately compute House Scores (Standings) without waiting for another render or network call
        const units = Array.isArray(resUnits) && resUnits.length > 0 ? resUnits : [];
        const standings = Array.isArray(resStandings) && resStandings.length > 0 ? resStandings : [];
        const colors = ['#FF2B2B', '#E5E7EB', '#38BDF8', '#F59E0B', '#10B981', '#8B5CF6'];
        const accents = [
          'from-[#FF2B2B] to-[#990000]', 
          'from-slate-200 to-slate-500', 
          'from-sky-400 to-blue-600', 
          'from-[#F59E0B] to-amber-700',
          'from-emerald-400 to-emerald-700',
          'from-purple-400 to-purple-700'
        ];

        if (standings.length > 0) {
          const scores: HouseScore[] = standings.map((s: any, i: number) => ({
            id: s.unitId || `unit_${i}`,
            name: s.unitName,
            code: s.unitCode || s.unitName.substring(0, 3).toUpperCase(),
            color: colors[i % colors.length],
            accentColor: accents[i % accents.length],
            totalPoints: s.overallPoints || 0,
            goldCount: s.firstPlaceCount || 0,
            silverCount: s.secondPlaceCount || 0,
            bronzeCount: s.thirdPlaceCount || 0
          }));
          setHouseScores(scores);
        } else if (units.length > 0) {
          const scoreMap: Record<string, HouseScore> = {};
          units.forEach((u: any, i: number) => {
            scoreMap[u.name] = { 
              id: u.id, 
              name: u.name, 
              code: u.code || u.name.substring(0, 3).toUpperCase(), 
              color: colors[i % colors.length], 
              accentColor: accents[i % accents.length], 
              totalPoints: 0, 
              goldCount: 0, 
              silverCount: 0, 
              bronzeCount: 0 
            };
          });

          rawResults.forEach(r => {
            if (r.deletedAt || !r.publishedStatus) return;
            const h = scoreMap[r.department];
            if (h) {
              const rankPts = r.rank === 1 ? 20 : r.rank === 2 ? 14 : r.rank === 3 ? 7 : 0;
              h.totalPoints += rankPts;
              if (r.rank === 1) h.goldCount++;
              if (r.rank === 2) h.silverCount++;
              if (r.rank === 3) h.bronzeCount++;
            }
          });

          setHouseScores(Object.values(scoreMap).sort((a, b) => b.totalPoints - a.totalPoints));
        }

        // Revalidate stored participant on mount to ensure fresh live data
        const currentSavedAuth = safeStorageGet<AuthUser | null>('rendezvous_auth_user', null);
        if (currentSavedAuth && currentSavedAuth.role === 'participant' && currentSavedAuth.participant) {
          const cNo = currentSavedAuth.participant.codeNumber || currentSavedAuth.username;
          if (cNo) {
            loginUnifiedByChestNo(cNo.toString());
          }
        }
      } catch (err) {
        console.error("Failed to fetch public data:", err);
      }
    };

    fetchAllPublicData();
  }, []);

  // Auth Handlers
  const openLoginModal = (tab: 'participant' | 'committee' | 'developer' = 'participant') => {
    setLoginInitialTab(tab);
    setIsLoginModalOpen(true);
    setActiveModalView('login');
  };

  // Reactively recompute participant results whenever public results arrive or change
  useEffect(() => {
    if (!authUser || authUser.role !== 'participant' || !authUser.participant) return;
    const p = authUser.participant;
    const cleanChest = (p.codeNumber || authUser.username || '').toString().trim().toLowerCase();
    const candidateTeamIds = ((p as any).candidateTeams || []).map((t: any) => t.id);

    const freshParticipantResults = (results || []).filter(r => {
      const rPartId = r.participantId || (r.raw && r.raw.participantId);
      const rCode = (r.codeNumber || r.chestNumber || (r.raw && r.raw.codeNumber) || (r.raw && r.raw.chestNumber) || '').toString().trim().toLowerCase();
      const rName = (r.participantName || (r.raw && r.raw.participantName) || '').toString().trim().toLowerCase();
      
      const isIdMatch = Boolean(rPartId && p.id && rPartId === p.id);
      const isCodeMatch = Boolean(rCode && cleanChest && rCode === cleanChest);
      const isNameMatch = Boolean(!rCode && !rPartId && rName && p.name && typeof p.name === 'string' && rName === p.name.trim().toLowerCase());
      const isTeamMatch = Boolean(
        (r.teamId && candidateTeamIds.includes(r.teamId)) ||
        (r.raw && r.raw.teamMemberIds && Array.isArray(r.raw.teamMemberIds) && (r.raw.teamMemberIds.includes(p.id) || r.raw.teamMemberIds.includes(cleanChest))) ||
        (r.teamMemberIds && Array.isArray(r.teamMemberIds) && (r.teamMemberIds.includes(p.id) || r.teamMemberIds.includes(cleanChest)))
      );

      return isIdMatch || isCodeMatch || isNameMatch || isTeamMatch;
    });

    setAuthUser(prev => {
      if (!prev || !prev.participant) return prev;
      const currentRes = prev.participant.results || [];
      const currentIds = currentRes.map(x => x.id || `${x.competitionId}_${x.rank}`).join(',');
      const freshIds = freshParticipantResults.map(x => x.id || `${x.competitionId}_${x.rank}`).join(',');
      if (currentIds === freshIds && currentRes.length === freshParticipantResults.length) {
        return prev;
      }
      return {
        ...prev,
        participant: {
          ...prev.participant,
          results: freshParticipantResults
        }
      };
    });
  }, [results]);

  const loginUnified = async (username: string, password?: string) => {
    try {
      const res = await fetch('/api/public/auth/participant-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chestNumber: username.trim(), dob: password, candidateClass: password, classVal: password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      
      const found = data.participant;
      const cleanChest = (found.chestNumber || username).toString().trim();
      const candidateTeams = found.candidateTeams || [];
      const candidateTeamIds = candidateTeams.map((t: any) => t.id);

      // Raw schedule from real registered comps
      const rawComps = data.registeredComps || data.registeredPrograms || found.registeredPrograms || found.schedule || found.registeredComps || [];
      const mappedSchedule = rawComps.map((prog: any, idx: number) => ({
        id: prog.id || prog.competitionId || `prog_${idx}`,
        program: prog.program || prog.name || prog.eventName || prog.title || 'Registered Program',
        category: prog.category || found.categoryName || found.category || 'General',
        stage: prog.stage || (prog.stageType === 'on_stage' ? 'On Stage' : prog.stageType === 'off_stage' ? 'Off Stage' : 'Main Stage'),
        time: prog.time || prog.startTime || '09:00 AM',
        status: prog.status || 'upcoming',
        participationType: prog.participationType || 'individual'
      }));

      // Merge API results and context results without duplicating
      const apiResults = data.participantResults || found.results || [];
      const contextResults = (results || []).filter(r => {
        const rPartId = r.participantId || (r.raw && r.raw.participantId);
        const rCode = (r.codeNumber || r.chestNumber || (r.raw && r.raw.codeNumber) || (r.raw && r.raw.chestNumber) || '').toString().trim().toLowerCase();
        const rName = (r.participantName || (r.raw && r.raw.participantName) || '').toString().trim().toLowerCase();
        
        const isIdMatch = Boolean(rPartId && found.id && rPartId === found.id);
        const isCodeMatch = Boolean(rCode && cleanChest && rCode === cleanChest.toLowerCase());
        const isNameMatch = Boolean(!rCode && !rPartId && rName && found.name && typeof found.name === 'string' && rName === found.name.trim().toLowerCase());
        const isTeamMatch = Boolean(
          (r.teamId && candidateTeamIds.includes(r.teamId)) ||
          (r.raw && r.raw.teamMemberIds && Array.isArray(r.raw.teamMemberIds) && (r.raw.teamMemberIds.includes(found.id) || r.raw.teamMemberIds.includes(cleanChest))) ||
          (r.teamMemberIds && Array.isArray(r.teamMemberIds) && (r.teamMemberIds.includes(found.id) || r.teamMemberIds.includes(cleanChest)))
        );

        return isIdMatch || isCodeMatch || isNameMatch || isTeamMatch;
      });

      const resultMap = new Map();
      [...apiResults, ...contextResults].forEach(r => {
        const rId = r.id || `${r.competitionId}_${r.rank}`;
        if (!resultMap.has(rId)) {
          resultMap.set(rId, r);
        }
      });
      const participantResults = Array.from(resultMap.values());
      
      const updatedParticipant: ParticipantProfile = {
        id: found.id || `part_${cleanChest}`,
        codeNumber: (found.chestNumber || found.codeNumber || cleanChest).toString(),
        password: '',
        name: found.fullName || found.name || cleanChest,
        department: found.unitName || found.department || '',
        category: found.categoryName || found.category || '',
        dob: found.dob || found.dateOfBirth || password || '',
        candidateClass: found.candidateClass || found.class || '',
        avatarUrl: found.avatarUrl || found.profilePhotoUrl || NO_DP_AVATAR,
        qrCodeData: (found.chestNumber || found.codeNumber || cleanChest).toString(),
        schedule: mappedSchedule,
        results: participantResults,
        matchedPhotos: []
      };

      const user: AuthUser = {
        role: 'participant',
        username: cleanChest,
        name: updatedParticipant.name,
        avatarUrl: updatedParticipant.avatarUrl,
        participant: updatedParticipant
      };

      setAuthUser(user);
      setIsLoginModalOpen(false);
      setActiveModalView('participant-profile');
      
      if (typeof window !== 'undefined') {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('chestNo', updatedParticipant.codeNumber);
        window.history.pushState({}, '', newUrl.toString());
      }
      
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error. Please try again later.' };
    }
  };

  const loginUnifiedByChestNo = async (chestNo: string) => {
    try {
      const cleanChest = chestNo.trim();
      if (!cleanChest) return { success: false, error: 'Chest number empty' };

      let found: any = null;
      let apiRegisteredComps: any[] = [];
      let apiParticipantResults: any[] = [];

      try {
        const res = await fetch(`/api/public/participant/by-chest/${encodeURIComponent(cleanChest)}?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          found = data.participant || data;
          apiRegisteredComps = data.registeredComps || found.registeredPrograms || found.schedule || [];
          apiParticipantResults = data.participantResults || found.results || [];
        }
      } catch (e) {
        console.warn("API fetch error in loginUnifiedByChestNo, falling back", e);
      }

      // Check in CMS state participants array if API didn't return found
      if (!found) {
        const localPart = (participants || []).find(p => 
          (p.codeNumber && p.codeNumber.toString().trim().toLowerCase() === cleanChest.toLowerCase()) ||
          (p.chestNumber && p.chestNumber.toString().trim().toLowerCase() === cleanChest.toLowerCase()) ||
          (p.id && p.id.toString().trim().toLowerCase() === cleanChest.toLowerCase())
        );
        if (localPart) {
          found = localPart;
          apiRegisteredComps = localPart.registeredPrograms || localPart.schedule || [];
          apiParticipantResults = localPart.results || [];
        }
      }

      if (!found || found.isNotFound) {
        return { success: false, error: 'Participant not found for this chest number' };
      }

      const candidateTeams = found.candidateTeams || [];
      const candidateTeamIds = candidateTeams.map((t: any) => t.id);

      // Raw schedule strictly from real registered comps
      const rawScheduleList = apiRegisteredComps.length > 0
        ? apiRegisteredComps
        : (found.registeredPrograms || found.schedule || found.registeredComps || []);

      const mappedSchedule = rawScheduleList.map((prog: any, idx: number) => ({
        id: prog.id || prog.competitionId || `prog_${idx}`,
        program: prog.program || prog.name || prog.eventName || prog.title || prog.competitionName || 'Registered Program',
        category: prog.category || found.categoryName || found.category || 'General',
        stage: prog.stage || (prog.stageType === 'on_stage' ? 'On Stage' : prog.stageType === 'off_stage' ? 'Off Stage' : 'Main Stage'),
        time: prog.time || prog.startTime || '09:00 AM',
        status: prog.status || 'upcoming',
        participationType: prog.participationType || 'individual'
      }));

      // Filter context results matching this participant
      const contextResults = (results || []).filter(r => {
        const rPartId = r.participantId || (r.raw && r.raw.participantId);
        const rCode = (r.codeNumber || r.chestNumber || (r.raw && r.raw.codeNumber) || (r.raw && r.raw.chestNumber) || '').toString().trim().toLowerCase();
        const rName = (r.participantName || (r.raw && r.raw.participantName) || '').toString().trim().toLowerCase();
        
        const isIdMatch = Boolean(rPartId && found.id && rPartId === found.id);
        const isCodeMatch = Boolean(rCode && cleanChest && rCode === cleanChest.toLowerCase());
        const isNameMatchFallback = Boolean(!rCode && !rPartId && rName && found.name && typeof found.name === 'string' && rName === found.name.trim().toLowerCase());
        const isTeamMatch = Boolean(
          (r.teamId && candidateTeamIds.includes(r.teamId)) ||
          (r.raw && r.raw.teamMemberIds && Array.isArray(r.raw.teamMemberIds) && (r.raw.teamMemberIds.includes(found.id) || r.raw.teamMemberIds.includes(cleanChest))) ||
          (r.teamMemberIds && Array.isArray(r.teamMemberIds) && (r.teamMemberIds.includes(found.id) || r.teamMemberIds.includes(cleanChest)))
        );

        return isIdMatch || isCodeMatch || isNameMatchFallback || isTeamMatch;
      });

      // Merge API results and context results
      const resultMap = new Map();
      [...apiParticipantResults, ...contextResults].forEach(r => {
        const rId = r.id || `${r.competitionId}_${r.rank}`;
        if (!resultMap.has(rId)) {
          resultMap.set(rId, r);
        }
      });
      const participantResults = Array.from(resultMap.values());

      const updatedParticipant: ParticipantProfile = {
        id: found.id || `part_${cleanChest}`,
        codeNumber: (found.chestNumber || found.codeNumber || cleanChest).toString(),
        password: '',
        name: found.fullName || found.name || cleanChest,
        department: found.unitName || found.department || found.institution || '',
        category: found.categoryName || found.category || '',
        dob: found.dob || found.dateOfBirth || '',
        candidateClass: found.candidateClass || found.class || '',
        avatarUrl: found.avatarUrl || found.profilePhotoUrl || NO_DP_AVATAR,
        qrCodeData: (found.chestNumber || found.codeNumber || cleanChest).toString(),
        schedule: mappedSchedule,
        results: participantResults,
        matchedPhotos: []
      };

      const user: AuthUser = {
        role: 'participant',
        username: cleanChest,
        name: updatedParticipant.name,
        avatarUrl: updatedParticipant.avatarUrl,
        participant: updatedParticipant
      };

      setAuthUser(user);
      setIsLoginModalOpen(false);
      setActiveModalView('participant-profile');

      // Preserve ?chestNo=... in browser URL bar smoothly
      if (typeof window !== 'undefined') {
        const currentUrl = new URL(window.location.href);
        if (currentUrl.searchParams.get('chestNo') !== cleanChest) {
          currentUrl.searchParams.set('chestNo', cleanChest);
          window.history.pushState({ page: 'participant', chestNo: cleanChest }, '', currentUrl.toString());
        }
      }
      return { success: true };
    } catch (err) {
      console.error("loginUnifiedByChestNo error:", err);
      return { success: false, error: 'Network error. Please try again later.' };
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkUrlAndLogin = () => {
      const params = new URLSearchParams(window.location.search);
      const urlChest = params.get('chestNo') || params.get('chestNumber') || params.get('c') || params.get('id');
      if (urlChest) {
        loginUnifiedByChestNo(urlChest);
      }
    };

    checkUrlAndLogin();

    // Listen for mobile back button or browser back gesture to navigate to Home Page instead of closing site
    const handlePopState = (e: PopStateEvent) => {
      const params = new URLSearchParams(window.location.search);
      const urlChest = params.get('chestNo') || params.get('chestNumber') || params.get('c') || params.get('id');
      if (urlChest) {
        loginUnifiedByChestNo(urlChest);
      } else {
        setActiveModalView('none');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const logout = () => {
    setAuthUser(null);
    setActiveModalView('none');
    
    // Clear URL parameter if logging out
    if (typeof window !== 'undefined') {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('chestNo');
      newUrl.searchParams.delete('chestNumber');
      newUrl.searchParams.delete('c');
      newUrl.searchParams.delete('id');
      newUrl.pathname = '/';
      window.history.pushState({ page: 'home' }, '', newUrl.toString());
    }
  };

  // Hero Media Handlers (Max 5 items limit enforcement)
  const addHeroMedia = (media: Omit<HeroMedia, 'id'>) => {
    if (heroMedia.length >= 5) {
      return { success: false, error: 'Maximum limit of 5 hero background media items reached! Please delete an item first.' };
    }
    const newItem: HeroMedia = {
      ...media,
      id: `hm-${Date.now()}`
    };
    setHeroMedia((prev) => [...prev, newItem]);
    return { success: true };
  };

  const removeHeroMedia = (id: string) => {
    if (heroMedia.length <= 1) {
      alert('At least 1 hero background item is required.');
      return;
    }
    setHeroMedia((prev) => prev.filter((item) => item.id !== id));
    setActiveHeroIndex(0);
  };

  // Result handlers
  const addResult = (item: Omit<ResultItem, 'id'>) => {
    const newResult: ResultItem = { ...item, id: `r-${Date.now()}` };
    setResults((prev) => [newResult, ...prev]);
  };

  const updateResult = (item: ResultItem) => {
    setResults((prev) => prev.map((r) => (r.id === item.id ? item : r)));
  };

  const deleteResult = (id: string) => {
    setResults((prev) => prev.filter((r) => r.id !== id));
  };

  // Gallery & SMILE handlers
  const addGalleryItem = (item: Omit<GalleryItem, 'id'>) => {
    const newItem: GalleryItem = { ...item, id: `g-${Date.now()}` };
    setGallery((prev) => [newItem, ...prev]);
  };

  const addSmilePhoto = (photo: Omit<SmilePhoto, 'id'>) => {
    const newPhoto: SmilePhoto = { ...photo, id: `sm-${Date.now()}` };
    setSmilePhotos((prev) => [newPhoto, ...prev]);
  };

  const updateStage = (stage: Stage) => {
    setStages((prev) => prev.map((s) => (s.id === stage.id ? stage : s)));
  };

  const addVideoHighlight = (video: Omit<VideoHighlight, 'id'>) => {
    const newVid: VideoHighlight = { ...video, id: `v-${Date.now()}` };
    setVideoHighlights((prev) => [newVid, ...prev]);
  };

  // CMS Handlers
  const addParticipant = (p: ParticipantProfile) => setParticipants(prev => [p, ...prev]);
  const updateParticipant = (p: ParticipantProfile) => {
    setParticipants(prev => {
      const exists = prev.find(x => x.codeNumber === p.codeNumber);
      if (exists) {
        return prev.map(x => x.codeNumber === p.codeNumber ? p : x);
      } else {
        return [p, ...prev];
      }
    });
    // Also update authUser if it's the current user
    setAuthUser(prev => {
      if (prev?.role === 'participant' && prev.participant?.codeNumber === p.codeNumber) {
        return { ...prev, avatarUrl: p.avatarUrl, participant: p };
      }
      return prev;
    });
  };
  const deleteParticipant = (codeNumber: string) => setParticipants(prev => prev.filter(x => x.codeNumber !== codeNumber));

  const addProgram = (p: Program) => setPrograms(prev => [p, ...prev]);
  const updateProgram = (p: Program) => setPrograms(prev => prev.map(x => x.id === p.id ? p : x));
  const deleteProgram = (id: string) => setPrograms(prev => prev.filter(x => x.id !== id));

  const addJudge = (j: JudgeProfile) => setJudges(prev => [j, ...prev]);
  const updateJudge = (j: JudgeProfile) => setJudges(prev => prev.map(x => x.id === j.id ? j : x));
  const deleteJudge = (id: string) => setJudges(prev => prev.filter(x => x.id !== id));

  const addMark = (m: MarkEntry) => setMarks(prev => [m, ...prev]);
  const updateMark = (m: MarkEntry) => setMarks(prev => prev.map(x => x.id === m.id ? m : x));
  const deleteMark = (id: string) => setMarks(prev => prev.filter(x => x.id !== id));

  // Simulated AI Face Recognition Matcher
  const runFaceRecognition = (faceImageDataUrl: string): FaceMatchResult => {
    setIsFaceScanning(true);
    
    // Scan all photos in SMILE and Gallery
    const allSearchablePhotos = [...smilePhotos, ...gallery.map(g => ({
      id: g.id,
      title: g.title,
      regCode: 'FESTIVAL-HD',
      participantName: 'Festival Participant',
      stage: g.category,
      imageUrl: g.imageUrl,
      timestamp: g.date,
      resolution: '4K Ultra HD',
      fileSize: '8.5 MB'
    }))];

    // Select matched photos probabilistically/deterministically based on hash or random set
    // Always returns 2-4 matched high quality photos
    const shuffled = [...allSearchablePhotos].sort(() => 0.5 - Math.random());
    const matched = shuffled.slice(0, Math.min( shuf(3, 4), shuffled.length ));

    setIsFaceScanning(false);

    return {
      matchedPhotos: matched,
      similarityScore: 98.4,
      matchCount: matched.length,
      faceFeaturesDetected: 68
    };
  };

  function shuf(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  return (
    <FestivalContext.Provider
      value={{
        authUser,
        loginUnified,
        loginUnifiedByChestNo,
        logout,
        isLoginModalOpen,
        setIsLoginModalOpen,
        loginInitialTab,
        openLoginModal,

        heroMedia,
        activeHeroIndex,
        setActiveHeroIndex,
        addHeroMedia,
        removeHeroMedia,

        results,
        addResult,
        updateResult,
        deleteResult,

        gallery,
        addGalleryItem,

        smilePhotos,
        addSmilePhoto,

        stages,
        updateStage,

        videoHighlights,
        addVideoHighlight,

        runFaceRecognition,
        isFaceScanning,

        activeModalView,
        setActiveModalView,

        participants,
        addParticipant,
        updateParticipant,
        deleteParticipant,

        programs,
        addProgram,
        updateProgram,
        deleteProgram,

        judges,
        addJudge,
        updateJudge,
        deleteJudge,

        marks,
        addMark,
        updateMark,
        deleteMark,

        houseScores,

        categories,

        eventSettings
      }}
    >
      {children}
    </FestivalContext.Provider>
  );
};

export const useFestival = () => {
  const context = useContext(FestivalContext);
  if (!context) {
    throw new Error('useFestival must be used within a FestivalProvider');
  }
  return context;
};
