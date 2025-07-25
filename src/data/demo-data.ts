import { User, Student, Teacher, Halaqa, Matn, NewsItem } from '../types';

// ORIGINAL Mutuun Template from React App with exact working audio links
const mutunTemplate = [
  {
    title: 'المستوى الأول',
    items: [
      { name: 'ثلاثة الأصول وأدلتها', memorization_pdf_link: 'https://drive.google.com/file/d/15yoRycyZ0H7CfAEyc11bsS99ur18UYNq/view?usp=sharing', memorization_audio_link: 'https://raw.githubusercontent.com/shero1111/maunatul_mutaallim_resources/main/1-1-usul-althalatha.mp3', explanation_pdf_link: 'https://drive.google.com/file/d/1BiWtqilJXJ5Me_sytvjt7UX1VODX3gYh/view?usp=sharing', explanation_audio_link: 'https://raw.githubusercontent.com/shero1111/maunatul_mutaallim_resources/main/1-1-usul-althalatha.mp3' },
      { name: 'المفتاح في الفقه', memorization_pdf_link: 'https://drive.google.com/file/d/15yoRycyZ0H7CfAEyc11bsS99ur18UYNq/view?usp=sharing', memorization_audio_link: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3', explanation_pdf_link: 'https://drive.google.com/file/d/1BiWtqilJXJ5Me_sytvjt7UX1VODX3gYh/view?usp=sharing', explanation_audio_link: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3' },
      { name: 'معاني الفاتحة وقصار المفصل', memorization_pdf_link: 'https://drive.google.com/file/d/15yoRycyZ0H7CfAEyc11bsS99ur18UYNq/view?usp=sharing', memorization_audio_link: 'http://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3', explanation_pdf_link: 'https://drive.google.com/file/d/1BiWtqilJXJ5Me_sytvjt7UX1VODX3gYh/view?usp=sharing', explanation_audio_link: 'http://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3' },
      { name: 'الأربعين النووية', memorization_pdf_link: 'https://drive.google.com/file/d/15yoRycyZ0H7CfAEyc11bsS99ur18UYNq/view?usp=sharing', memorization_audio_link: 'https://www2.cs.uic.edu/~i101/SoundFiles/PinkPanther30.wav', explanation_pdf_link: 'https://drive.google.com/file/d/1BiWtqilJXJ5Me_sytvjt7UX1VODX3gYh/view?usp=sharing', explanation_audio_link: 'https://www2.cs.uic.edu/~i101/SoundFiles/PinkPanther30.wav' },
      { name: 'الزيادة الرجبية', memorization_pdf_link: 'https://drive.google.com/file/d/15yoRycyZ0H7CfAEyc11bsS99ur18UYNq/view?usp=sharing', memorization_audio_link: '', explanation_pdf_link: 'https://drive.google.com/file/d/1BiWtqilJXJ5Me_sytvjt7UX1VODX3gYh/view?usp=sharing', explanation_audio_link: '' },
      { name: 'الآداب العشرة', memorization_pdf_link: 'https://drive.google.com/file/d/15yoRycyZ0H7CfAEyc11bsS99ur18UYNq/view?usp=sharing', memorization_audio_link: '', explanation_pdf_link: 'https://drive.google.com/file/d/1BiWtqilJXJ5Me_sytvjt7UX1VODX3gYh/view?usp=sharing', explanation_audio_link: '' },
      { name: 'الخلاصة الحسناء', memorization_pdf_link: 'https://drive.google.com/file/d/15yoRycyZ0H7CfAEyc11bsS99ur18UYNq/view?usp=sharing', memorization_audio_link: '', explanation_pdf_link: 'https://drive.google.com/file/d/1BiWtqilJXJ5Me_sytvjt7UX1VODX3gYh/view?usp=sharing', explanation_audio_link: '' },
      { name: 'الباقيات الصالحات', memorization_pdf_link: 'https://drive.google.com/file/d/15yoRycyZ0H7CfAEyc11bsS99ur18UYNq/view?usp=sharing', memorization_audio_link: '', explanation_pdf_link: 'https://drive.google.com/file/d/1BiWtqilJXJ5Me_sytvjt7UX1VODX3gYh/view?usp=sharing', explanation_audio_link: '' }
    ]
  },
  {
    title: 'المستوى الثاني',
    items: [
      { name: 'بهجة الطلب في آداب الطلب', memorization_pdf_link: 'https://drive.google.com/file/d/1THoLVMho76M3UH4xDwe8arKfJxCzDFwo/view?usp=sharing', memorization_audio_link: '', explanation_pdf_link: 'https://drive.google.com/file/d/185NOVYEzqXWoKH_BG-2Grwiv1s0A2FyU/view?usp=sharing', explanation_audio_link: '' },
      { name: 'فضل الإسلام', memorization_pdf_link: 'https://drive.google.com/file/d/1THoLVMho76M3UH4xDwe8arKfJxCzDFwo/view?usp=sharing', memorization_audio_link: '', explanation_pdf_link: 'https://drive.google.com/file/d/185NOVYEzqXWoKH_BG-2Grwiv1s0A2FyU/view?usp=sharing', explanation_audio_link: '' },
      { name: 'المقدمة الفقهية الصغرى', memorization_pdf_link: 'https://drive.google.com/file/d/1THoLVMho76M3UH4xDwe8arKfJxCzDFwo/view?usp=sharing', memorization_audio_link: '', explanation_pdf_link: 'https://drive.google.com/file/d/185NOVYEzqXWoKH_BG-2Grwiv1s0A2FyU/view?usp=sharing', explanation_audio_link: '' },
      { name: 'خلاصة تعظيم العلم', memorization_pdf_link: 'https://drive.google.com/file/d/1THoLVMho76M3UH4xDwe8arKfJxCzDFwo/view?usp=sharing', memorization_audio_link: '', explanation_pdf_link: 'https://drive.google.com/file/d/185NOVYEzqXWoKH_BG-2Grwiv1s0A2FyU/view?usp=sharing', explanation_audio_link: '' },
      { name: 'العقيدة الواسطية', memorization_pdf_link: 'https://drive.google.com/file/d/1THoLVMho76M3UH4xDwe8arKfJxCzDFwo/view?usp=sharing', memorization_audio_link: '', explanation_pdf_link: 'https://drive.google.com/file/d/185NOVYEzqXWoKH_BG-2Grwiv1s0A2FyU/view?usp=sharing', explanation_audio_link: '' }
    ]
  },
  {
    title: 'المستوى الثالث',
    items: [
      { name: 'كتاب التوحيد', memorization_pdf_link: 'https://drive.google.com/file/d/1NQ22itB7WinIPdMGGkEyHOCh6mhBDTJp/view?usp=sharing', memorization_audio_link: '', explanation_pdf_link: 'https://drive.google.com/file/d/1BiWtqilJXJ5Me_sytvjt7UX1VODX3gYh/view?usp=sharing', explanation_audio_link: '' },
      { name: 'القواعد الأربع', memorization_pdf_link: 'https://drive.google.com/file/d/1NQ22itB7WinIPdMGGkEyHOCh6mhBDTJp/view?usp=sharing', memorization_audio_link: '', explanation_pdf_link: 'https://drive.google.com/file/d/1BiWtqilJXJ5Me_sytvjt7UX1VODX3gYh/view?usp=sharing', explanation_audio_link: '' },
      { name: 'كشف الشبهات', memorization_pdf_link: 'https://drive.google.com/file/d/1NQ22itB7WinIPdMGGkEyHOCh6mhBDTJp/view?usp=sharing', memorization_audio_link: '', explanation_pdf_link: 'https://drive.google.com/file/d/1BiWtqilJXJ5Me_sytvjt7UX1VODX3gYh/view?usp=sharing', explanation_audio_link: '' }
    ]
  },
  {
    title: 'المستوى الرابع',
    items: [
      { name: 'منظومة القواعد الفقهية', memorization_pdf_link: 'https://drive.google.com/file/d/1dRY2HvNfAGY9jfEvhT1qjmz7M1eu31fb/view?usp=sharing', memorization_audio_link: '', explanation_pdf_link: 'https://drive.google.com/file/d/1L-tzUlNUPL9uuwEgGjKIiDMQ7z8D7yvZ/view?usp=sharing', explanation_audio_link: '' },
      { name: 'المقدمة الآجرومية', memorization_pdf_link: 'https://drive.google.com/file/d/1dRY2HvNfAGY9jfEvhT1qjmz7M1eu31fb/view?usp=sharing', memorization_audio_link: '', explanation_pdf_link: 'https://drive.google.com/file/d/1L-tzUlNUPL9uuwEgGjKIiDMQ7z8D7yvZ/view?usp=sharing', explanation_audio_link: '' },
      { name: 'خلاصة مقدمة أصول التفسير', memorization_pdf_link: 'https://drive.google.com/file/d/1dRY2HvNfAGY9jfEvhT1qjmz7M1eu31fb/view?usp=sharing', memorization_audio_link: '', explanation_pdf_link: 'https://drive.google.com/file/d/1L-tzUlNUPL9uuwEgGjKIiDMQ7z8D7yvZ/view?usp=sharing', explanation_audio_link: '' },
      { name: 'نخبة الفكر', memorization_pdf_link: 'https://drive.google.com/file/d/1dRY2HvNfAGY9jfEvhT1qjmz7M1eu31fb/view?usp=sharing', memorization_audio_link: '', explanation_pdf_link: 'https://drive.google.com/file/d/1L-tzUlNUPL9uuwEgGjKIiDMQ7z8D7yvZ/view?usp=sharing', explanation_audio_link: '' },
      { name: 'الورقات في أصول الفقه', memorization_pdf_link: 'https://drive.google.com/file/d/1dRY2HvNfAGY9jfEvhT1qjmz7M1eu31fb/view?usp=sharing', memorization_audio_link: '', explanation_pdf_link: 'https://drive.google.com/file/d/1L-tzUlNUPL9uuwEgGjKIiDMQ7z8D7yvZ/view?usp=sharing', explanation_audio_link: '' }
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