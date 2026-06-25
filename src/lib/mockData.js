import { addDays, subDays } from 'date-fns';

// Use a fixed base date to prevent server/client hydration mismatch
const baseDate = new Date("2026-06-01T12:00:00Z");

export const mockCourses = [
  {
    id: 'c1',
    title: 'The Happiness Program',
    slug: 'happiness-program',
    description: 'Discover the power of breath and meditation. Learn the Sudarshan Kriya to manage stress and enhance well-being.',
    teacher_name: 'Rahul Sharma',
    start_date: addDays(baseDate, 5).toISOString(),
    end_date: addDays(baseDate, 8).toISOString(),
    registration_close_date: addDays(baseDate, 4).toISOString(),
    image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80',
    venue: 'Art of Living Centre, Doranda',
    timings: '6:00 AM - 9:00 AM',
    registration_link: '#',
    created_at: subDays(baseDate, 2).toISOString(), // Created 2 days ago, so it's "NEW"
  },
  {
    id: 'c2',
    title: 'Sri Sri Yoga',
    slug: 'sri-sri-yoga',
    description: 'A holistic approach to yoga combining physical postures, breathing techniques, and meditation.',
    teacher_name: 'Priya Singh',
    start_date: addDays(baseDate, 15).toISOString(),
    end_date: addDays(baseDate, 20).toISOString(),
    registration_close_date: addDays(baseDate, 14).toISOString(),
    image_url: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&q=80',
    venue: 'Art of Living Centre, Doranda',
    timings: '6:00 PM - 8:00 PM',
    registration_link: '#',
    created_at: subDays(baseDate, 10).toISOString(), // Not new
  },
  {
    id: 'c3',
    title: 'Advanced Meditation Program',
    slug: 'amp',
    description: 'Experience deep rest and profound inner peace through guided meditations.',
    teacher_name: 'Swami Vishnudevananda',
    start_date: subDays(baseDate, 2).toISOString(),
    end_date: addDays(baseDate, 2).toISOString(),
    registration_close_date: subDays(baseDate, 3).toISOString(), // Closed
    image_url: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&q=80',
    venue: 'Ranchi Ashram',
    timings: 'Full Day',
    registration_link: '#',
    created_at: subDays(baseDate, 30).toISOString(),
  }
];

export const mockEvents = [
  {
    id: 'e1',
    title: 'Satsang Evening',
    slug: 'satsang-evening',
    description: 'Join us for an evening of soulful bhajans and meditation.',
    date: addDays(baseDate, 2).toISOString(),
    image_url: 'https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?auto=format&fit=crop&q=80',
    created_at: subDays(baseDate, 1).toISOString(), // NEW
  }
];

export const mockWisdom = {
  quote: "Don't fall in love, rise in love.",
  author: "Gurudev Sri Sri Ravi Shankar"
};

export const mockGallery = [
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80',
];
