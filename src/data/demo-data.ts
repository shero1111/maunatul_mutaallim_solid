import { User, Student, Teacher, Halaqa, Matn, NewsItem } from '../types';

// UPDATED Mutuun Template with Archive.org Audio Links
const mutunTemplate = [
  {
    title: 'المستوى الأول',
    items: [
      { 
        name: 'ثلاثة الأصول وأدلتها', 
        memorization_pdf_link: 'https://drive.google.com/file/d/15yoRycyZ0H7CfAEyc11bsS99ur18UYNq/view?usp=sharing', 
        memorization_audio_link: 'https://archive.org/download/1-1-usul-althalatha/1-1-usul-althalatha.mp3', 
        explanation_pdf_link: 'https://drive.google.com/file/d/1BiWtqilJXJ5Me_sytvjt7UX1VODX3gYh/view?usp=sharing', 
        explanation_audio_link: 'https://archive.org/download/1-1-usul-althalatha-explanation/1-1-usul-althalatha-explanation.mp3' 
      },
      { 
        name: 'المفتاح في الفقه', 
        memorization_pdf_link: '', 
        memorization_audio_link: 'https://archive.org/download/1-2-al-miftah-fi-al-fiqh/1-2-al-miftah-fi-al-fiqh.mp3', 
        explanation_pdf_link: '', 
        explanation_audio_link: 'https://archive.org/download/1-2-al-miftah-fi-al-fiqh-explanation/1-2-al-miftah-fi-al-fiqh-explanation.mp3' 
      },
      { 
        name: 'معاني الفاتحة وقصار المفصل', 
        memorization_pdf_link: '', 
        memorization_audio_link: 'https://archive.org/download/1-3-maani-al-fatihah-wa-qisar-al-mufassal/1-3-maani-al-fatihah-wa-qisar-al-mufassal.mp3', 
        explanation_pdf_link: '', 
        explanation_audio_link: 'https://archive.org/download/1-3-maani-al-fatihah-wa-qisar-al-mufassal-explanation/1-3-maani-al-fatihah-wa-qisar-al-mufassal-explanation.mp3' 
      },
      { 
        name: 'الأربعين النووية', 
        memorization_pdf_link: 'https://drive.google.com/file/d/1C-Pc9Yx9D6G-M-sJJ6Ybvd7mPKQ-m5N-/view?usp=sharing', 
        memorization_audio_link: 'https://archive.org/download/1-4-al-arbaeen-an-nawawiyyah/1-4-al-arbaeen-an-nawawiyyah.mp3', 
        explanation_pdf_link: 'https://drive.google.com/file/d/1s1e-6uQ8y8_S7S0Bj9Qpk4q-kM7X-z1/view?usp=sharing', 
        explanation_audio_link: 'https://archive.org/download/1-4-al-arbaeen-an-nawawiyyah-explanation/1-4-al-arbaeen-an-nawawiyyah-explanation.mp3' 
      },
      { 
        name: 'الزيادة الرجبية', 
        memorization_pdf_link: '', 
        memorization_audio_link: 'https://archive.org/download/1-5-az-ziyadah-ar-rajabiyyah/1-5-az-ziyadah-ar-rajabiyyah.mp3', 
        explanation_pdf_link: '', 
        explanation_audio_link: 'https://archive.org/download/1-5-az-ziyadah-ar-rajabiyyah-explanation/1-5-az-ziyadah-ar-rajabiyyah-explanation.mp3' 
      },
      { 
        name: 'الآداب العشرة', 
        memorization_pdf_link: '', 
        memorization_audio_link: 'https://archive.org/download/1-6-al-adab-al-asharah/1-6-al-adab-al-asharah.mp3', 
        explanation_pdf_link: '', 
        explanation_audio_link: 'https://archive.org/download/1-6-al-adab-al-asharah-explanation/1-6-al-adab-al-asharah-explanation.mp3' 
      }
    ]
  },
  {
    title: 'المستوى الثاني',
    items: [
      { 
        name: 'آداب المشي إلى الصلاة', 
        memorization_pdf_link: 'https://drive.google.com/file/d/1QhLyKkXJlGbVzV5cVpMxZ8qWyTnO1I2N/view?usp=sharing', 
        memorization_audio_link: '', 
        explanation_pdf_link: 'https://drive.google.com/file/d/1NG_aXyRyT-_tYzJm7H7uP2rN3lO9Ak4V/view?usp=sharing', 
        explanation_audio_link: '' 
      },
      { 
        name: 'الورقات في أصول الفقه', 
        memorization_pdf_link: 'https://drive.google.com/file/d/1pFqXhVyVnY5oN8wX4r2Tb6jK1Oj9Zx3L/view?usp=sharing', 
        memorization_audio_link: '', 
        explanation_pdf_link: 'https://drive.google.com/file/d/1u9VxKmJhB7Ag6LpM3nO1Xc5WyZnV2Gq8/view?usp=sharing', 
        explanation_audio_link: '' 
      },
      { 
        name: 'نخبة الفكر في مصطلح أهل الأثر', 
        memorization_pdf_link: 'https://drive.google.com/file/d/1W8jKlRvNmY3xP6oZ9qA2Cs4DtF7Hg1I5/view?usp=sharing', 
        memorization_audio_link: '', 
        explanation_pdf_link: 'https://drive.google.com/file/d/1x7FgHkJmVnB5Np3wQ8rE4Zy2Lp6Oj9K1/view?usp=sharing', 
        explanation_audio_link: '' 
      },
      { 
        name: 'شرح السنة للبربهاري', 
        memorization_pdf_link: 'https://drive.google.com/file/d/1EhLyVxNzKpB7wA8qG3rM5tO2Cn1Dj6F9/view?usp=sharing', 
        memorization_audio_link: '', 
        explanation_pdf_link: 'https://drive.google.com/file/d/1m4PqWyTgBvC8xL9nR2uJ6kF3Oj7Gh5I1/view?usp=sharing', 
        explanation_audio_link: '' 
      }
    ]
  },
  {
    title: 'المستوى الثالث',
    items: [
      { 
        name: 'كتاب التوحيد', 
        memorization_pdf_link: 'https://drive.google.com/file/d/1VxMzLpGhKjN5wQ2Y8rT4uA7Cs9Df3Hm1/view?usp=sharing', 
        memorization_audio_link: '', 
        explanation_pdf_link: 'https://drive.google.com/file/d/1n6OjKmBvHyC4xL8pQ9rF2Zy5Gk3Wj7I9/view?usp=sharing', 
        explanation_audio_link: '' 
      },
      { 
        name: 'كشف الشبهات', 
        memorization_pdf_link: 'https://drive.google.com/file/d/1YzNgLkRhTpA3xM6wE9uB4Cs7Fj8Hm2I5/view?usp=sharing', 
        memorization_audio_link: '', 
        explanation_pdf_link: 'https://drive.google.com/file/d/1p7QjMvCyGzD5yN8rK1uL4Aw6Bk9Oj3F2/view?usp=sharing', 
        explanation_audio_link: '' 
      },
      { 
        name: 'الآجرومية', 
        memorization_pdf_link: 'https://drive.google.com/file/d/1BzFhKoLmRpC6yN9xQ2uT5Aw8Dj1Gk4I7/view?usp=sharing', 
        memorization_audio_link: '', 
        explanation_pdf_link: 'https://drive.google.com/file/d/1r8VjPyCzHvF7wO1sK3mE6Lz9Qj2Gk5H8/view?usp=sharing', 
        explanation_audio_link: '' 
      }
    ]
  },
  {
    title: 'المستوى الرابع',
    items: [
      { 
        name: 'مختصر صحيح مسلم', 
        memorization_pdf_link: 'https://drive.google.com/file/d/1DzGkJpMvRyE8xQ3wT6uA9Cs2Fj5Hm7I1/view?usp=sharing', 
        memorization_audio_link: '', 
        explanation_pdf_link: 'https://drive.google.com/file/d/1t9WjQzCyIvG8yR1sL4nF7Bz3Qk6Hm9J2/view?usp=sharing', 
        explanation_audio_link: '' 
      },
      { 
        name: 'عمدة الفقه', 
        memorization_pdf_link: 'https://drive.google.com/file/d/1FzIkLpNvSyH9xS4wU7rB1Dt6Gj8Km2I5/view?usp=sharing', 
        memorization_audio_link: '', 
        explanation_pdf_link: 'https://drive.google.com/file/d/1v1XjRzDyJvI9yT2sM5oG8Cz4Rl7Jm1K6/view?usp=sharing', 
        explanation_audio_link: '' 
      }
    ]
  }
];

export const generatePersonalMutun = (userId: string): Matn[] => {
  const personalMutun: Matn[] = [];
  let matnId = 1;
  
  mutunTemplate.forEach(section => {
    section.items.forEach(item => {
      personalMutun.push({
        id: `${userId}_matn_${matnId}`,
        name: item.name,
        section: section.title,
        status: 'red',
        description: '',
        threshold: 7, // Default 7 Tage
        lastChange_date: new Date().toISOString().split('T')[0], // Same format as React app
        memorization_pdf_link: item.memorization_pdf_link,
        memorization_audio_link: item.memorization_audio_link,
        explanation_pdf_link: item.explanation_pdf_link,
        explanation_audio_link: item.explanation_audio_link,
        created_at: new Date().toISOString(),
        user_id: userId,
        days_since_last_revision: 0, // Add missing field from React app
        audio_link: item.memorization_audio_link // For compatibility
      });
      matnId++;
    });
  });
  
  return personalMutun;
};

// Demo Users
export const demoUsers: (Student | Teacher | User)[] = [
  { 
    id: 'admin', 
    username: 'admin', 
    password: 'test', 
    role: 'superuser', 
    name: 'Administrator', 
    isActive: true, 
    created_at: '2024-01-01', 
    lastPage: 'home' 
  },
  { 
    id: 'leiter', 
    username: 'leiter', 
    password: 'test', 
    role: 'leitung', 
    name: 'Leiter', 
    isActive: true, 
    created_at: '2024-01-01', 
    lastPage: 'home' 
  },
  { 
    id: 'lehrer', 
    username: 'lehrer', 
    password: 'test', 
    role: 'lehrer', 
    name: 'Lehrer', 
    isActive: true, 
    created_at: '2024-01-01', 
    halaqat_ids: ['halaqa1', 'halaqa2'], 
    favorites: ['student1', 'student2'], 
    lastPage: 'home' 
  } as Teacher,
  { 
    id: 'student1', 
    username: 'student1', 
    password: 'test', 
    role: 'student', 
    name: 'Ahmad Al-Mahmoud', 
    isActive: true, 
    created_at: '2024-01-01', 
    status: 'revising', 
    status_changed_at: '2024-01-15T10:30:00Z', 
    halaqat_ids: ['halaqa1'], 
    favorites: ['student2'], 
    lastPage: 'home' 
  } as Student,
  { 
    id: 'student2', 
    username: 'student2', 
    password: 'test', 
    role: 'student', 
    name: 'Omar Al-Rashid', 
    isActive: true, 
    created_at: '2024-01-01', 
    status: 'khatamat', 
    status_changed_at: '2024-01-14T09:15:00Z', 
    halaqat_ids: ['halaqa1', 'halaqa2'], 
    favorites: [], 
    lastPage: 'home' 
  } as Student,
  { 
    id: 'student3', 
    username: 'student3', 
    password: 'test', 
    role: 'student', 
    name: 'Yusuf Al-Faruq', 
    isActive: true, 
    created_at: '2024-01-01', 
    status: 'not_available', 
    status_changed_at: '2024-01-13T16:45:00Z', 
    halaqat_ids: ['halaqa1'], 
    favorites: ['student1'], 
    lastPage: 'home' 
  } as Student
];

// Demo Halaqat
export const demoHalaqat: Halaqa[] = [
  {
    id: 'halaqa1',
    name: 'حلقة الحفظ المتقدمة',
    type: 'memorizing',
    teacher_id: 'lehrer',
    student_ids: ['student1', 'student2', 'student3'],
    internal_number: 1,
    isActive: true
  },
  {
    id: 'halaqa2',
    name: 'حلقة التفسير والشرح',
    type: 'explanation',
    teacher_id: 'lehrer',
    student_ids: ['student2'],
    internal_number: 2,
    isActive: true
  }
];

// Demo Mutun - Empty, will be generated per user
export const demoMutun: Matn[] = [];

// Demo News
export const demoNews: NewsItem[] = [
  {
    id: 'news1',
    title: 'افتتاح حلقة جديدة للتحفيظ',
    description: 'نعلن عن افتتاح حلقة جديدة لتحفيظ القرآن الكريم للمبتدئين',
    created_at: '2024-01-15T10:00:00Z',
    author_id: 'admin'
  },
  {
    id: 'news2', 
    title: 'مسابقة الحفظ السنوية',
    description: 'تعلن إدارة المعهد عن بدء التسجيل في مسابقة الحفظ السنوية',
    created_at: '2024-01-10T14:30:00Z',
    author_id: 'leiter'
  }
];