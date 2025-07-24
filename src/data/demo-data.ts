import { User, Student, Teacher, Halaqa, Matn, NewsItem } from '../types';

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
  } as Student
];

// Demo Halaqat
export const demoHalaqat: Halaqa[] = [
  {
    id: 'halaqa1',
    name: 'حلقة الحفظ المتقدمة',
    type: 'memorizing',
    teacher_id: 'lehrer',
    student_ids: ['student1', 'student2'],
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

// Demo Mutun
export const demoMutun: Matn[] = [
  {
    id: 'matn1',
    name: 'القرآن الكريم',
    section: 'القرآن',
    status: 'green',
    lastChange_date: '2024-01-10',
    user_id: 'student1',
    threshold: 30,
    description: 'الحفظ مع التجويد',
    audio_link: 'https://example.com/quran-audio.mp3'
  },
  {
    id: 'matn2', 
    name: 'صحيح البخاري',
    section: 'الحديث',
    status: 'orange',
    lastChange_date: '2024-01-05',
    user_id: 'student1',
    threshold: 45,
    description: 'أحاديث مختارة',
    memorization_pdf_link: 'https://example.com/bukhari.pdf'
  },
  {
    id: 'matn3',
    name: 'الأجرومية',
    section: 'النحو',
    status: 'red',
    user_id: 'student1', 
    threshold: 60,
    description: 'قواعد النحو الأساسية',
    explanation_pdf_link: 'https://example.com/ajrumiya-explanation.pdf'
  }
];

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

// Helper function to generate personal mutun for a user
export const generatePersonalMutun = (userId: string): Matn[] => {
  const sections = ['القرآن', 'الحديث', 'العقيدة', 'الفقه', 'النحو', 'البلاغة'];
  const mutunNames: Record<string, string[]> = {
    'القرآن': ['القرآن الكريم', 'التفسير الميسر'],
    'الحديث': ['صحيح البخاري', 'صحيح مسلم', 'رياض الصالحين'],
    'العقيدة': ['العقيدة الطحاوية', 'كتاب التوحيد'],
    'الفقه': ['عمدة الفقه', 'الكافي في الفقه'],
    'النحو': ['الأجرومية', 'قطر الندى'],
    'البلاغة': ['البلاغة الواضحة', 'تلخيص المفتاح']
  };

  const result: Matn[] = [];
  let matnId = 1;

  sections.forEach(section => {
    mutunNames[section].forEach(name => {
      result.push({
        id: `matn_${userId}_${matnId}`,
        name,
        section,
        status: ['red', 'orange', 'green'][Math.floor(Math.random() * 3)] as 'red' | 'orange' | 'green',
        lastChange_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        user_id: userId,
        threshold: 30 + Math.floor(Math.random() * 60),
        description: '',
        audio_link: Math.random() > 0.7 ? `https://example.com/audio/${matnId}.mp3` : undefined,
        memorization_pdf_link: Math.random() > 0.5 ? `https://example.com/pdf/${matnId}.pdf` : undefined,
        explanation_pdf_link: Math.random() > 0.8 ? `https://example.com/explanation/${matnId}.pdf` : undefined
      });
      matnId++;
    });
  });

  return result;
};