// Storage utility for localStorage management
// USER PASSWORD: Change the value below to set a custom user password
export const USER_PASSWORD = '1234';
export const EDITOR_PASSWORD = 'Hxdi.132';

const STORAGE_KEYS = {
  REASONS: 'beats_reasons',
  TIMELINE: 'beats_timeline',
  HAS_SEEN_HEART: 'beats_has_seen_heart'
};

// Default data structures
const getDefaultReasons = () => [];

const getDefaultTimeline = () => [
  {
    id: '1',
    image: null,
    caption: 'Our first moment together',
    date: new Date().toISOString()
  },
  {
    id: '2',
    image: null,
    caption: 'A memory we made',
    date: new Date().toISOString()
  },
  {
    id: '3',
    image: null,
    caption: 'Forever cherished',
    date: new Date().toISOString()
  }
];

// Initialize storage with defaults if empty
export const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.REASONS)) {
    localStorage.setItem(STORAGE_KEYS.REASONS, JSON.stringify(getDefaultReasons()));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TIMELINE)) {
    localStorage.setItem(STORAGE_KEYS.TIMELINE, JSON.stringify(getDefaultTimeline()));
  }
};

// Reasons CRUD
export const getReasons = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.REASONS);
    return data ? JSON.parse(data) : getDefaultReasons();
  } catch {
    return getDefaultReasons();
  }
};

export const setReasons = (reasons) => {
  localStorage.setItem(STORAGE_KEYS.REASONS, JSON.stringify(reasons));
};

export const addReason = (text) => {
  const reasons = getReasons();
  reasons.push({
    id: Date.now().toString(),
    text
  });
  setReasons(reasons);
  return reasons;
};

export const updateReason = (id, text) => {
  const reasons = getReasons();
  const index = reasons.findIndex(r => r.id === id);
  if (index !== -1) {
    reasons[index].text = text;
    setReasons(reasons);
  }
  return reasons;
};

export const deleteReason = (id) => {
  const reasons = getReasons().filter(r => r.id !== id);
  setReasons(reasons);
  return reasons;
};

// Timeline CRUD
export const getTimeline = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TIMELINE);
    return data ? JSON.parse(data) : getDefaultTimeline();
  } catch {
    return getDefaultTimeline();
  }
};

export const setTimeline = (timeline) => {
  localStorage.setItem(STORAGE_KEYS.TIMELINE, JSON.stringify(timeline));
};

export const addTimelineItem = (caption, image = null) => {
  const timeline = getTimeline();
  timeline.push({
    id: Date.now().toString(),
    image,
    caption,
    date: new Date().toISOString()
  });
  setTimeline(timeline);
  return timeline;
};

export const updateTimelineItem = (id, updates) => {
  const timeline = getTimeline();
  const index = timeline.findIndex(t => t.id === id);
  if (index !== -1) {
    timeline[index] = { ...timeline[index], ...updates };
    setTimeline(timeline);
  }
  return timeline;
};

export const deleteTimelineItem = (id) => {
  const timeline = getTimeline().filter(t => t.id !== id);
  setTimeline(timeline);
  return timeline;
};

// Heart seen state
export const getHasSeenHeart = () => {
  return localStorage.getItem(STORAGE_KEYS.HAS_SEEN_HEART) === 'true';
};

export const setHasSeenHeart = (value) => {
  localStorage.setItem(STORAGE_KEYS.HAS_SEEN_HEART, value.toString());
};
