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
        explanation_audio_link: 'https://archive.org/download/1-2-al-miftah-fi-al-fiqh-explanation/1-1-usul-althalatha-explanation.mp3' 
      },
      { 
        name: 'المفتاح في الفقه', 
        memorization_pdf_link: '', 
        memorization_audio_link: 'https://archive.org/download/1-3-maani-al-fatihah-wa-qisar-al-mufassal/1-2-al-miftah-fi-al-fiqh.mp3', 
        explanation_pdf_link: '', 
        explanation_audio_link: 'https://archive.org/download/1-2-al-miftah-fi-al-fiqh-explanation/1-2-al-miftah-fi-al-fiqh-explanation.mp3' 
      },
      { 
        name: 'معاني الفاتحة وقصار المفصل', 
        memorization_pdf_link: '', 
        memorization_audio_link: 'https://archive.org/download/1-3-maani-al-fatihah-wa-qisar-al-mufassal/1-3-maani-al-fatihah-wa-qisar-al-mufassal.mp3', 
        explanation_pdf_link: '', 
        explanation_audio_link: 'https://archive.org/download/1-2-al-miftah-fi-al-fiqh-explanation/1-3-maani-al-fatihah-wa-qisar-al-mufassal-explanation.mp3' 
      },
      { 
        name: 'الأربعون النووية', 
        memorization_pdf_link: 'https://drive.google.com/file/d/1ZGp5cOOq1eO_tWVFyOKA-8PGnLcnqgJn/view?usp=sharing', 
        memorization_audio_link: 'https://archive.org/download/1-3-maani-al-fatihah-wa-qisar-al-mufassal/1-4-al-arbaeen-an-nawawiyyah.mp3', 
        explanation_pdf_link: '', 
        explanation_audio_link: 'https://archive.org/download/1-2-al-miftah-fi-al-fiqh-explanation/1-4-al-arbaeen-an-nawawiyyah-explanation.mp3' 
      },
      { 
        name: 'الزيادة الرجبية', 
        memorization_pdf_link: '', 
        memorization_audio_link: 'https://archive.org/download/1-3-maani-al-fatihah-wa-qisar-al-mufassal/1-5-az-ziyadah-ar-rajabiyyah.mp3', 
        explanation_pdf_link: '', 
        explanation_audio_link: 'https://archive.org/download/1-2-al-miftah-fi-al-fiqh-explanation/1-5-az-ziyadah-ar-rajabiyyah-explanation.mp3' 
      },
      { 
        name: 'الآداب العشرة', 
        memorization_pdf_link: '', 
        memorization_audio_link: 'https://archive.org/download/1-3-maani-al-fatihah-wa-qisar-al-mufassal/1-6-al-adab-al-asharah.mp3', 
        explanation_pdf_link: '', 
        explanation_audio_link: 'https://archive.org/download/1-2-al-miftah-fi-al-fiqh-explanation/1-6-al-adab-al-asharah-explanation.mp3' 
      }
    ]
  },
  {
    title: 'المستوى الثاني',
    items: [
      { 
        name: 'كشف الشبهات', 
        memorization_pdf_link: 'https://drive.google.com/file/d/1aGVUMT2vqODwB4BYEVvXYGEv2x7u5Qcc/view?usp=sharing', 
        memorization_audio_link: '', 
        explanation_pdf_link: '', 
        explanation_audio_link: '' 
      },
      { 
        name: 'جواهر الكلمات', 
        memorization_pdf_link: '', 
        memorization_audio_link: '', 
        explanation_pdf_link: '', 
        explanation_audio_link: '' 
      },
      { 
        name: 'أصول في الفقه', 
        memorization_pdf_link: '', 
        memorization_audio_link: '', 
        explanation_pdf_link: '', 
        explanation_audio_link: '' 
      }
    ]
  },
  {
    title: 'المستوى الثالث',
    items: [
      { 
        name: 'كتاب التوحيد', 
        memorization_pdf_link: 'https://drive.google.com/file/d/1lU7-g8XChCW2VKhKgV-qrn6J6ZO9GGWE/view?usp=sharing', 
        memorization_audio_link: '', 
        explanation_pdf_link: '', 
        explanation_audio_link: '' 
      },
      { 
        name: 'الأصول الستة', 
        memorization_pdf_link: '', 
        memorization_audio_link: '', 
        explanation_pdf_link: '', 
        explanation_audio_link: '' 
      }
    ]
  },
  {
    title: 'المستوى الرابع',
    items: [
      { 
        name: 'العقيدة الواسطية', 
        memorization_pdf_link: '', 
        memorization_audio_link: '', 
        explanation_pdf_link: '', 
        explanation_audio_link: '' 
      },
      { 
        name: 'العقيدة الطحاوية', 
        memorization_pdf_link: '', 
        memorization_audio_link: '', 
        explanation_pdf_link: '', 
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
    publish_date: '2024-01-15T10:00:00Z',
    author_id: 'admin'
  },
  {
    id: 'news2', 
    title: 'مسابقة الحفظ السنوية',
    description: 'تعلن إدارة المعهد عن بدء التسجيل في مسابقة الحفظ السنوية',
    created_at: '2024-01-10T14:30:00Z',
    publish_date: '2024-01-10T14:30:00Z',
    author_id: 'leiter'
  }
];