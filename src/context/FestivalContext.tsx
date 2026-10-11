import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AuthUser,
  ParticipantProfile,
  ResultItem,
  GalleryItem,
  HouseScore
} from '../types';
import {
  NO_DP_AVATAR
} from '../data/festivalData';

interface FestivalContextType {
  // Auth state
  authUser: AuthUser | null;
  loginUnified: (username: string, password?: string) => { success: boolean; error?: string };
  loginUnifiedByChestNo: (chestNo: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  loginInitialTab: 'participant';
  openLoginModal: (tab?: 'participant') => void;

  // Dynamic Content Data (Live from Backend)
  results: ResultItem[];
  gallery: GalleryItem[];

  // Participant State
  updateParticipant: (p: ParticipantProfile) => void;

  // UI Portals State
  activeModalView: 'none' | 'login' | 'participant-profile';
  setActiveModalView: (view: 'none' | 'login' | 'participant-profile') => void;

  // Dynamic Standings
  houseScores: HouseScore[];
  standingsMeta: { resultsCount?: number; publishedAt?: string | null; isSnapshot?: boolean; liveResultsCount?: number } | null;

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
  // 1. Auth State (Multi-SaaS ready festival_auth_user key)
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    return safeStorageGet<AuthUser | null>('festival_auth_user', null) || safeStorageGet<AuthUser | null>('rendezvous_auth_user', null);
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginInitialTab, setLoginInitialTab] = useState<'participant'>('participant');
  const [activeModalView, setActiveModalView] = useState<'none' | 'login' | 'participant-profile'>('none');

  useEffect(() => {
    try {
      if (authUser) {
        localStorage.setItem('festival_auth_user', JSON.stringify(authUser));
      } else {
        localStorage.removeItem('festival_auth_user');
      }
      localStorage.removeItem('rendezvous_auth_user');
      localStorage.removeItem('rendezvous_hero_media_v2');
    } catch (_) {}
  }, [authUser]);

  // 2. Dynamic Data States (Live from Backend)
  const [results, setResults] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [eventSettings, setEventSettings] = useState<any>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [houseScores, setHouseScores] = useState<HouseScore[]>([]);
  const [standingsMeta, setStandingsMeta] = useState<{ resultsCount?: number; publishedAt?: string | null; isSnapshot?: boolean; liveResultsCount?: number } | null>(null);

  // Unified Initial Data Fetch (Eliminating Waterfall: All endpoints fetched in parallel)
  useEffect(() => {
    const fetchAllPublicData = async () => {
      try {
        const [resResults, resSettings, resCategories, resStandings, resUnits, resMeta] = await Promise.all([
          fetch('/api/public/results').then(r => r.ok ? r.json() : []).catch(() => []),
          fetch('/api/public/settings').then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/public/categories').then(r => r.ok ? r.json() : []).catch(() => []),
          fetch('/api/public/standings').then(r => r.ok ? r.json() : []).catch(() => []),
          fetch('/api/public/units').then(r => r.ok ? r.json() : []).catch(() => []),
          fetch('/api/public/standings/meta').then(r => r.ok ? r.json() : null).catch(() => null)
        ]);

        if (resMeta && typeof resMeta === 'object') {
          setStandingsMeta(resMeta);
        }

        const rawResults = Array.isArray(resResults) ? resResults : [];
        setResults(rawResults);

        if (resSettings && typeof resSettings === 'object' && Object.keys(resSettings).length > 0) {
          setEventSettings((prev: any) => {
            const merged = { ...prev, ...resSettings };
            if (!resSettings.posterTemplateConfig && prev?.posterTemplateConfig) {
              merged.posterTemplateConfig = prev.posterTemplateConfig;
            }
            if (!merged.participantLoginCriteria || merged.participantLoginCriteria === 'dob') {
              merged.participantLoginCriteria = 'class';
            }
            if (!merged.availableClasses || merged.availableClasses.length === 0) {
              merged.availableClasses = ['+1', '+2'];
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
        } else {
          setHouseScores([]);
        }

        // Revalidate stored participant on mount to ensure fresh live data
        const currentSavedAuth = safeStorageGet<AuthUser | null>('festival_auth_user', null) || safeStorageGet<AuthUser | null>('rendezvous_auth_user', null);
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
  const openLoginModal = (tab: 'participant' = 'participant') => {
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

      // Registered competitions from live database
      const rawComps = data.registeredComps || data.registeredPrograms || found.registeredPrograms || found.registeredComps || [];
      const mappedSchedule = rawComps.map((prog: any, idx: number) => ({
        id: prog.id || prog.competitionId || `prog_${idx}`,
        program: prog.program || prog.name || prog.eventName || prog.title || prog.competitionName || 'Registered Program',
        category: prog.category || found.categoryName || found.category || '',
        stage: prog.stage || (prog.stageType === 'on_stage' ? 'On Stage' : prog.stageType === 'off_stage' ? 'Off Stage' : ''),
        time: prog.time || prog.startTime || '',
        status: prog.status || '',
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

      if (!found || found.isNotFound) {
        return { success: false, error: 'Participant not found for this chest number' };
      }

      const candidateTeams = found.candidateTeams || [];
      const candidateTeamIds = candidateTeams.map((t: any) => t.id);

      // Registered competitions from live database
      const rawScheduleList = apiRegisteredComps.length > 0
        ? apiRegisteredComps
        : (found.registeredPrograms || found.registeredComps || []);

      const mappedSchedule = rawScheduleList.map((prog: any, idx: number) => ({
        id: prog.id || prog.competitionId || `prog_${idx}`,
        program: prog.program || prog.name || prog.eventName || prog.title || prog.competitionName || 'Registered Program',
        category: prog.category || found.categoryName || found.category || '',
        stage: prog.stage || (prog.stageType === 'on_stage' ? 'On Stage' : prog.stageType === 'off_stage' ? 'Off Stage' : ''),
        time: prog.time || prog.startTime || '',
        status: prog.status || '',
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

  // Participant update handler
  const updateParticipant = (p: ParticipantProfile) => {
    setAuthUser(prev => {
      if (prev?.role === 'participant' && prev.participant?.codeNumber === p.codeNumber) {
        return { ...prev, avatarUrl: p.avatarUrl, participant: p };
      }
      return prev;
    });
  };

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

        results,
        gallery,

        activeModalView,
        setActiveModalView,

        updateParticipant,

        houseScores,
        categories,
        eventSettings,
        standingsMeta
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
