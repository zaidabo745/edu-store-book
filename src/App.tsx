import React, { useState, useEffect } from 'react';

// --- Data Interfaces ---
interface Subject {
  id: string;
  name: string;
  students: number;
  distribution: number;
  booksPerCarton: number;
}

interface SchoolClass {
  id:string;
  name: string;
  subjects: Subject[];
}

interface School {
  id: string;
  name: string;
  classes: SchoolClass[];
  defaultSubjectValues: {
    students: number;
    distribution: number;
    booksPerCarton: number;
  };
}

interface LogEntry {
  id: string;
  date: string;
  data: School[];
}

interface Settings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'x-small' | 'small' | 'medium' | 'large' | 'x-large';
}


// --- Confirmation Modal Component ---
const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }: {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>تأكيد الإجراء</h3>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary-modal" onClick={onCancel}>إلغاء</button>
          <button className="btn btn-danger" onClick={onConfirm}>تأكيد الحذف</button>
        </div>
      </div>
    </div>
  );
};


// --- Settings Modal Component ---
const SettingsModal = ({ isOpen, onClose, currentSettings, onSave }: {
    isOpen: boolean;
    onClose: () => void;
    currentSettings: Settings;
    onSave: (newSettings: Settings) => void;
}) => {
    const [localSettings, setLocalSettings] = useState(currentSettings);

    useEffect(() => {
        setLocalSettings(currentSettings);
    }, [currentSettings, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(localSettings);
        onClose();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>الإعدادات</h3>
                </div>
                <div className="modal-body">
                    <div className="settings-group">
                        <h4>المظهر (الثيم)</h4>
                        <div className="segmented-control">
                            <button className={localSettings.theme === 'light' ? 'active' : ''} onClick={() => setLocalSettings(s => ({ ...s, theme: 'light' }))}>فاتح</button>
                            <button className={localSettings.theme === 'dark' ? 'active' : ''} onClick={() => setLocalSettings(s => ({ ...s, theme: 'dark' }))}>داكن</button>
                            <button className={localSettings.theme === 'system' ? 'active' : ''} onClick={() => setLocalSettings(s => ({ ...s, theme: 'system' }))}>النظام</button>
                        </div>
                    </div>
                    <div className="settings-group">
                        <h4>حجم الخط</h4>
                        <div className="segmented-control font-size-control">
                            <button className={localSettings.fontSize === 'x-small' ? 'active' : ''} onClick={() => setLocalSettings(s => ({ ...s, fontSize: 'x-small' }))}>صغير جداً</button>
                            <button className={localSettings.fontSize === 'small' ? 'active' : ''} onClick={() => setLocalSettings(s => ({ ...s, fontSize: 'small' }))}>صغير</button>
                            <button className={localSettings.fontSize === 'medium' ? 'active' : ''} onClick={() => setLocalSettings(s => ({ ...s, fontSize: 'medium' }))}>متوسط</button>
                            <button className={localSettings.fontSize === 'large' ? 'active' : ''} onClick={() => setLocalSettings(s => ({ ...s, fontSize: 'large' }))}>كبير</button>
                            <button className={localSettings.fontSize === 'x-large' ? 'active' : ''} onClick={() => setLocalSettings(s => ({ ...s, fontSize: 'x-large' }))}>كبير جداً</button>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary-modal" onClick={onClose}>إلغاء</button>
                    <button className="btn btn-primary" onClick={handleSave}>حفظ</button>
                </div>
            </div>
        </div>
    );
};


// --- Initial State Factory ---
const createNewSubject = (): Subject => ({
  id: crypto.randomUUID(),
  name: '',
  students: 0,
  distribution: 100,
  booksPerCarton: 0,
});

const createNewClass = (): SchoolClass => ({
  id: crypto.randomUUID(),
  name: 'الصف الأول',
  subjects: [createNewSubject()],
});

const createNewSchool = (): School => ({
  id: crypto.randomUUID(),
  name: '',
  classes: [createNewClass()],
  defaultSubjectValues: {
    students: 0,
    distribution: 100,
    booksPerCarton: 0,
  },
});

// --- Pure Calculation Function ---
// FIX: Changed return type from JSX.Element to React.ReactElement to fix "Cannot find namespace 'JSX'" error.
const calculateClassResult = (schoolClass: SchoolClass, school: School, viewMode: 'summary' | 'detailed' = 'detailed'): React.ReactElement => {
    const getQuantityLine = (totalBooksNeeded: number, booksPerCarton: number): string => {
        if (booksPerCarton <= 0) return 'عدد الكتب بالكرتون غير صحيح.';
        const fullCartons = Math.floor(totalBooksNeeded / booksPerCarton);
        const remainingBooks = totalBooksNeeded % booksPerCarton;

        if (remainingBooks === 0) {
            return `${fullCartons} كرتون بالضبط.`;
        } else if (remainingBooks <= booksPerCarton / 2) {
            return `${fullCartons} كرتون، مع إضافة ${remainingBooks} كتاب.`;
        } else {
            const booksToSubtract = booksPerCarton - remainingBooks;
            return `${fullCartons + 1} كرتون، مع إنقاص ${booksToSubtract} كتاب.`;
        }
    };

    if (viewMode === 'summary') {
        return (
            <div className="result-summary">
                <h5 className="result-summary-title">ملخص: {school.name || 'مدرسة بدون اسم'} - {schoolClass.name}</h5>
                <ul className="result-summary-list">
                    {schoolClass.subjects.map(subject => {
                        const subjectIncomplete = !subject.students || subject.students <= 0 || !subject.booksPerCarton || subject.booksPerCarton <= 0 || !subject.distribution || subject.distribution <= 0;
                        if (subjectIncomplete) {
                            return (
                                <li key={subject.id}>
                                    <span className="subject-name">{subject.name || 'مادة بدون اسم'}</span>
                                    <span className="subject-result-incomplete">(بيانات غير مكتملة)</span>
                                </li>
                            );
                        }
                        const totalBooksNeeded = Math.ceil(subject.students * (subject.distribution / 100));
                        return (
                             <li key={subject.id}>
                                <span className="subject-name">{subject.name || 'مادة بدون اسم'}:</span>
                                <span className="subject-result">{getQuantityLine(totalBooksNeeded, subject.booksPerCarton)}</span>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    }

    // Detailed view
    return (
        <div className="result-detailed">
            <h5 className="result-detailed-title">{school.name || 'مدرسة بدون اسم'} - {schoolClass.name}</h5>
            {schoolClass.subjects.map((subject, index) => {
                 const isLastSubject = index === schoolClass.subjects.length - 1;
                 const subjectIncomplete = !subject.students || subject.students <= 0 || !subject.booksPerCarton || subject.booksPerCarton <= 0 || !subject.distribution || subject.distribution <= 0;

                 if (subjectIncomplete) {
                     return (
                         <div key={subject.id} className={`result-subject-item ${isLastSubject ? 'is-last' : ''}`}>
                             <p className="subject-name">{subject.name || 'مادة بدون اسم'}</p>
                             <p className="subject-result-incomplete">(بيانات غير مكتملة)</p>
                         </div>
                     );
                 }

                const totalBooksNeeded = Math.ceil(subject.students * (subject.distribution / 100));
                const booksPerCarton = subject.booksPerCarton;
                const quantityLine = getQuantityLine(totalBooksNeeded, booksPerCarton);
                const quarter = Math.round(booksPerCarton / 4);
                const half = Math.round(booksPerCarton / 2);
                const threeQuarters = Math.round((booksPerCarton / 4) * 3);

                return (
                    <div key={subject.id} className={`result-subject-item ${isLastSubject ? 'is-last' : ''}`}>
                        <p className="subject-name">{subject.name || 'مادة بدون اسم'}</p>
                        <div className="result-details">
                            <p><strong>الحساب لـ:</strong> <span>{totalBooksNeeded} كتاب (بنسبة {subject.distribution}%)</span></p>
                            <p><strong>الكمية:</strong> <span>{quantityLine}</span></p>
                            <p className="breakdown-line"><strong>تفصيل الكرتون:</strong> <span>ربع={quarter} | نصف={half} | ثلاثة أرباع={threeQuarters}</span></p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};


// --- Main Application Component ---
const App = () => {
  const [schools, setSchools] = useState<School[]>(() => {
    const savedData = localStorage.getItem('schoolData');
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            if (Array.isArray(parsedData) && parsedData.length > 0) {
                 // Migration logic: ensure every school has defaultSubjectValues
                 return parsedData.map((school: any) => ({
                    ...school,
                    defaultSubjectValues: school.defaultSubjectValues || {
                        students: 0,
                        distribution: 100,
                        booksPerCarton: 0,
                    }
                }));
            }
        } catch (error) {
            console.error("Failed to parse school data from localStorage", error);
        }
    }
    return [createNewSchool()];
  });
  
  const [log, setLog] = useState<LogEntry[]>(() => {
    const savedLog = localStorage.getItem('schoolLog');
    if (savedLog) {
        try {
            return JSON.parse(savedLog);
        } catch (error) {
            console.error("Failed to parse log data from localStorage", error);
            return [];
        }
    }
    return [];
  });
  
  const [activeTab, setActiveTab] = useState<'main' | 'log'>('main');
  const [justAddedClass, setJustAddedClass] = useState(false);
  
  const [modalState, setModalState] = useState({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  });

  const [classViewModes, setClassViewModes] = useState<{ [key: string]: 'summary' | 'detailed' }>({});
  
  const defaultSettings: Settings = { theme: 'system', fontSize: 'medium' };
  const [settings, setSettings] = useState<Settings>(() => {
    const savedSettings = localStorage.getItem('appSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // --- Save to Local Storage ---
  useEffect(() => {
    localStorage.setItem('schoolData', JSON.stringify(schools));
  }, [schools]);

  useEffect(() => {
    localStorage.setItem('schoolLog', JSON.stringify(log));
  }, [log]);

  // --- Apply & Save Settings ---
  useEffect(() => {
      localStorage.setItem('appSettings', JSON.stringify(settings));

      document.documentElement.setAttribute('data-font-size', settings.fontSize);

      const applyTheme = () => {
        let effectiveTheme = settings.theme;
        if (settings.theme === 'system') {
          effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        document.documentElement.setAttribute('data-theme', effectiveTheme);
      };

      applyTheme();
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [settings]);


  // --- Modal Control ---
  const closeConfirmationModal = () => {
    setModalState({ isOpen: false, message: '', onConfirm: () => {} });
  };

  // --- State Updaters ---
  const updateSchool = (schoolId: string, updatedSchool: Partial<School>) => {
    setSchools(schools.map(s => s.id === schoolId ? { ...s, ...updatedSchool } : s));
  };

  const updateClass = (schoolId: string, classId: string, updatedClass: Partial<SchoolClass>) => {
    const school = schools.find(s => s.id === schoolId);
    if (school) {
      const newClasses = school.classes.map(c => c.id === classId ? { ...c, ...updatedClass } : c);
      updateSchool(schoolId, { classes: newClasses });
    }
  };

  const updateSubject = (schoolId: string, classId: string, subjectId: string, updatedSubject: Partial<Subject>) => {
      const school = schools.find(s => s.id === schoolId);
      if (school) {
          const schoolClass = school.classes.find(c => c.id === classId);
          if (schoolClass) {
              const newSubjects = schoolClass.subjects.map(sub => sub.id === subjectId ? { ...sub, ...updatedSubject } : sub);
              updateClass(schoolId, classId, { subjects: newSubjects });
          }
      }
  };

  // --- Handlers ---
  const handleAddSchool = () => {
    setSchools([...schools, createNewSchool()]);
  };

  const handleRemoveSchool = (schoolId: string) => {
    setModalState({
      isOpen: true,
      message: 'هل أنت متأكد من حذف هذه المدرسة وكل ما فيها من بيانات؟ لا يمكن التراجع عن هذا الإجراء.',
      onConfirm: () => {
        setSchools(prevSchools => prevSchools.filter(s => s.id !== schoolId));
        closeConfirmationModal();
      },
    });
  };

  const handleAddClass = (schoolId: string) => {
    const school = schools.find(s => s.id === schoolId);
    if (school) {
      const newClass = { ...createNewClass(), name: `الصف ${school.classes.length + 1}` };
      updateSchool(schoolId, { classes: [...school.classes, newClass] });
    }
  };
  
  const handleAddClassToLastSchool = () => {
    if (schools.length > 0) {
      handleAddClass(schools[schools.length - 1].id);
      setJustAddedClass(true);
      setTimeout(() => setJustAddedClass(false), 1500);
    }
  };

  const handleRemoveClass = (schoolId: string, classId: string) => {
    setModalState({
      isOpen: true,
      message: 'هل أنت متأكد من حذف هذا الصف وكل مواده؟ لا يمكن التراجع عن هذا الإجراء.',
      onConfirm: () => {
        const school = schools.find(s => s.id === schoolId);
        if (school) {
          updateSchool(schoolId, { classes: school.classes.filter(c => c.id !== classId) });
        }
        closeConfirmationModal();
      },
    });
  };

  const handleAddSubject = (schoolId: string, classId: string) => {
    const school = schools.find(s => s.id === schoolId);
    if (school) {
        const schoolClass = school.classes.find(c => c.id === classId);
        if (schoolClass) {
            const newSubjectWithDefaults: Subject = {
              id: crypto.randomUUID(),
              name: '',
              students: school.defaultSubjectValues.students,
              distribution: school.defaultSubjectValues.distribution,
              booksPerCarton: school.defaultSubjectValues.booksPerCarton,
            };
            updateClass(schoolId, classId, { subjects: [...schoolClass.subjects, newSubjectWithDefaults] });
        }
    }
  };

  const handleRemoveSubject = (schoolId: string, classId: string, subjectId: string) => {
    setModalState({
      isOpen: true,
      message: 'هل أنت متأكد من حذف هذه المادة؟',
      onConfirm: () => {
        const school = schools.find(s => s.id === schoolId);
        if (school) {
            const schoolClass = school.classes.find(c => c.id === classId);
            if (schoolClass) {
                updateClass(schoolId, classId, { subjects: schoolClass.subjects.filter(sub => sub.id !== subjectId) });
            }
        }
        closeConfirmationModal();
      },
    });
  };
  
  const handleSchoolDefaultValueChange = (schoolId: string, field: 'students' | 'distribution' | 'booksPerCarton', value: string) => {
    const numValue = parseInt(value, 10);
    const school = schools.find(s => s.id === schoolId);
    if (school) {
        const newDefaults = {
            ...school.defaultSubjectValues,
            [field]: isNaN(numValue) ? 0 : numValue
        };
        updateSchool(schoolId, { defaultSubjectValues: newDefaults });
    }
  };
  
  const handleToggleClassViewMode = (classId: string) => {
    setClassViewModes(prev => ({
        ...prev,
        [classId]: prev[classId] === 'summary' ? 'detailed' : 'summary'
    }));
  };

  const exportToExcel = (dataToExport: School[] = schools, date?: string) => {
    const worksheetName = "بيانات الكتب";

    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  <Worksheet ss:Name="${worksheetName}">
    <Table>`;
    
    const xmlFooter = `</Table>
  </Worksheet>
</Workbook>`;

    const createRow = (cells: string[]) => `<Row>${cells.join('')}</Row>`;
    
    const createCell = (data: any, type: 'String' | 'Number' = 'String') => {
        const sanitizedData = typeof data === 'string' 
            ? data.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
            : data;
        return `<Cell><Data ss:Type="${type}">${sanitizedData}</Data></Cell>`;
    };

    const headers = [
        "المدرسة", "الصف", "المادة", "عدد الطلاب", "نسبة التوزيع", "الكتب بالكرتون", "إجمالي الكتب", "الكمية المطلوبة"
    ];
    let tableRowsXml = createRow(headers.map(h => createCell(h)));

    dataToExport.forEach(school => {
        school.classes.forEach(cls => {
            cls.subjects.forEach(sub => {
                 if (!sub.students || sub.students <= 0 || !sub.distribution || !sub.booksPerCarton) {
                     return; // Skip incomplete subjects
                 }
                 const totalBooksNeeded = Math.ceil(sub.students * (sub.distribution / 100));
                 
                 let cartonText = '0';
                 if (sub.booksPerCarton > 0) {
                     const fullCartons = Math.floor(totalBooksNeeded / sub.booksPerCarton);
                     const remainingBooks = totalBooksNeeded % sub.booksPerCarton;
                    if (remainingBooks === 0) {
                        cartonText = `${fullCartons} كرتون`;
                    } else {
                        cartonText = `${fullCartons} كرتون و ${remainingBooks} كتاب`;
                    }
                 }
                 
                 const rowCells = [
                    createCell(school.name || 'مدرسة بدون اسم'),
                    createCell(cls.name),
                    createCell(sub.name || 'مادة بدون اسم'),
                    createCell(sub.students, 'Number'),
                    createCell(sub.distribution, 'Number'),
                    createCell(sub.booksPerCarton, 'Number'),
                    createCell(totalBooksNeeded, 'Number'),
                    createCell(cartonText)
                 ];
                 tableRowsXml += createRow(rowCells);
            });
        });
    });

    const xmlData = `\uFEFF${xmlHeader}${tableRowsXml}${xmlFooter}`;
    
    const blob = new Blob([xmlData], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const fileName = date 
      ? `بيانات_الكتب_${new Date(date).toLocaleDateString('ar-EG-u-nu-latn').replace(/\//g, '-')}.xls`
      : "بيانات_الكتب_الحالية.xls";
    link.download = fileName;
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToWord = (dataToExport: School[] = schools, date?: string) => {
    const title = "تقرير توزيع الكتب المدرسية";
    let content = `
    <html xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
    <meta http-equiv=Content-Type content="text/html; charset=utf-8">
    <title>${title}</title>
    <style>
        @page Section1 {
            size:8.5in 11.0in;
            margin:1.0in 1.0in 1.0in 1.0in;
        }
        div.Section1 { page:Section1; }
        body { font-family: 'Arial', sans-serif; direction: rtl; text-align: right; }
        h1 { font-size: 20pt; color: #2F5496; border-bottom: 2px solid #BFBFBF; padding-bottom: 8px; margin-bottom: 16px; }
        h2 { font-size: 16pt; color: #4472C4; border-bottom: 1px solid #D9D9D9; padding-bottom: 4px; margin-top: 24px; margin-bottom: 12px; }
        h3.date-header { font-size: 12pt; color: #595959; font-weight: normal; margin-bottom: 24px; }
        div.subject-report { margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px dotted #D9D9D9; }
        div.subject-report:last-child { border-bottom: none; }
        p { margin: 4px 0; font-size: 11pt; }
        p.subject-name { font-weight: bold; font-size: 12pt; }
    </style>
    </head>
    <body>
        <div class=Section1>
        <h1>${title}</h1>
    `;

    if (date) {
        content += `<h3 class="date-header">تاريخ العملية: ${new Date(date).toLocaleString('ar-EG')}</h3>`;
    }

    dataToExport.forEach(school => {
        content += `<h1>${school.name || 'مدرسة بدون اسم'}</h1>`;
        school.classes.forEach(cls => {
            content += `<h2>${cls.name}</h2>`;
            
            cls.subjects.forEach(subject => {
                content += '<div class="subject-report">';
                if (!subject.students || subject.students <= 0 || !subject.booksPerCarton || subject.booksPerCarton <= 0 || !subject.distribution || subject.distribution <= 0) {
                    content += `<p class="subject-name">${subject.name || 'مادة بدون اسم'}</p><p>(بيانات غير مكتملة)</p>`;
                } else {
                    const totalBooksNeeded = Math.ceil(subject.students * (subject.distribution / 100));
                    const booksPerCarton = subject.booksPerCarton;
                    const fullCartons = Math.floor(totalBooksNeeded / booksPerCarton);
                    const remainingBooks = totalBooksNeeded % booksPerCarton;

                    let quantityLine = '';
                    if (remainingBooks === 0) {
                        quantityLine = `<strong>الكمية:</strong> ${fullCartons} كرتون بالضبط.`;
                    } else if (remainingBooks <= booksPerCarton / 2) {
                        quantityLine = `<strong>الكمية:</strong> ${fullCartons} كرتون، مع إضافة ${remainingBooks} كتاب.`;
                    } else {
                        const booksToSubtract = booksPerCarton - remainingBooks;
                        quantityLine = `<strong>الكمية:</strong> ${fullCartons + 1} كرتون، مع إنقاص ${booksToSubtract} كتاب.`;
                    }

                    const quarter = Math.round(booksPerCarton / 4);
                    const half = Math.round(booksPerCarton / 2);
                    const threeQuarters = Math.round((booksPerCarton / 4) * 3);
                    const breakdownLine = `<strong>تفصيل الكرتون:</strong> ربع=${quarter} | نصف=${half} | ثلاثة أرباع=${threeQuarters}`;

                    content += `
                        <p class="subject-name">${subject.name || 'مادة بدون اسم'}</p>
                        <p><strong>الحساب لـ:</strong> ${totalBooksNeeded} كتاب (بنسبة ${subject.distribution}%)</p>
                        <p>${quantityLine}</p>
                        <p>${breakdownLine}</p>
                    `;
                }
                content += '</div>';
            });
        });
    });

    content += '</div></body></html>';
    
    const blob = new Blob([content], { type: 'application/msword;charset=utf-8' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const fileName = date 
      ? `تقرير_الكتب_${new Date(date).toLocaleDateString('ar-EG-u-nu-latn').replace(/\//g, '-')}.doc`
      : "تقرير_الكتب_الحالي.doc";
    link.download = fileName;
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleArchive = () => {
      const newLogEntry: LogEntry = {
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          data: JSON.parse(JSON.stringify(schools)) // Deep copy
      };
      setLog(prevLog => [newLogEntry, ...prevLog]);
      setActiveTab('log'); // Switch to log view after archiving
  };
  
  const handleDeleteLogEntry = (id: string) => {
    setModalState({
      isOpen: true,
      message: 'هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء.',
      onConfirm: () => {
        setLog(prevLog => prevLog.filter(entry => entry.id !== id));
        closeConfirmationModal();
      },
    });
  };
  
  const handleClearLog = () => {
    setModalState({
      isOpen: true,
      message: 'هل أنت متأكد من مسح السجل بالكامل؟ لا يمكن التراجع عن هذا الإجراء.',
      onConfirm: () => {
        setLog([]);
        closeConfirmationModal();
      },
    });
  };

  return (
    <div>
      <ConfirmationModal
        isOpen={modalState.isOpen}
        message={modalState.message}
        onConfirm={modalState.onConfirm}
        onCancel={closeConfirmationModal}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentSettings={settings}
        onSave={setSettings}
      />

      <header className="header">
        <h1>برنامج تسهيل عمليات صرف الكتب المدرسية</h1>
      </header>

      <div className="tabs-container">
        <button className="settings-btn" onClick={() => setIsSettingsModalOpen(true)} aria-label="الإعدادات">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
            </svg>
        </button>
        <div className="tabs">
          <button className={`tab-btn ${activeTab === 'main' ? 'active' : ''}`} onClick={() => setActiveTab('main')}>
            الرئيسية
          </button>
          <button className={`tab-btn ${activeTab === 'log' ? 'active' : ''}`} onClick={() => setActiveTab('log')}>
            السجل {log.length > 0 && `(${log.length})`}
          </button>
        </div>
      </div>
      
      {activeTab === 'main' && (
        <div id="main-content">
          {schools.map((school) => (
            <div key={school.id} className="school-card">
              <div className="card-header">
                <div className="form-group">
                    <input 
                        type="text" 
                        id={`schoolName-${school.id}`} 
                        className="form-control" 
                        placeholder="أدخل اسم المدرسة" 
                        value={school.name}
                        onChange={(e) => updateSchool(school.id, { name: e.target.value })}
                    />
                </div>
                {schools.length > 1 && <button className="remove-btn" onClick={() => handleRemoveSchool(school.id)}>&times;</button>}
              </div>

              <div className="school-default-settings">
                  <h4>الإعدادات الافتراضية للمواد الجديدة في هذه المدرسة</h4>
                  <div className="settings-grid">
                      <div className="form-group">
                          <label htmlFor={`defaultStudents-${school.id}`}>عدد الطلاب</label>
                          <input
                              type="number"
                              id={`defaultStudents-${school.id}`}
                              inputMode="numeric"
                              className="form-control"
                              value={school.defaultSubjectValues.students || ''}
                              onChange={(e) => handleSchoolDefaultValueChange(school.id, 'students', e.target.value)}
                          />
                      </div>
                      <div className="form-group">
                          <label htmlFor={`defaultDistribution-${school.id}`}>نسبة التوزيع (%)</label>
                          <input
                              type="number"
                              id={`defaultDistribution-${school.id}`}
                              inputMode="numeric"
                              className="form-control"
                              value={school.defaultSubjectValues.distribution || ''}
                              onChange={(e) => handleSchoolDefaultValueChange(school.id, 'distribution', e.target.value)}
                          />
                      </div>
                      <div className="form-group">
                          <label htmlFor={`defaultBooksPerCarton-${school.id}`}>الكتب بالكرتون</label>
                          <input
                              type="number"
                              id={`defaultBooksPerCarton-${school.id}`}
                              inputMode="numeric"
                              className="form-control"
                              value={school.defaultSubjectValues.booksPerCarton || ''}
                              onChange={(e) => handleSchoolDefaultValueChange(school.id, 'booksPerCarton', e.target.value)}
                          />
                      </div>
                  </div>
              </div>


              {school.classes.map((schoolClass) => (
                <div key={schoolClass.id} className="class-card">
                   <div className="card-header">
                    <div className="form-group">
                      <select 
                        id={`className-${schoolClass.id}`} 
                        className="form-control"
                        value={schoolClass.name}
                        onChange={(e) => updateClass(school.id, schoolClass.id, { name: e.target.value })}
                      >
                        {[...Array(12).keys()].map(i => <option key={i} value={`الصف ${i+1}`}>الصف {i+1}</option>)}
                      </select>
                    </div>
                     {school.classes.length > 1 && <button className="remove-btn" onClick={() => handleRemoveClass(school.id, schoolClass.id)}>&times;</button>}
                  </div>
                  
                  {schoolClass.subjects.map(subject => (
                    <div key={subject.id} className="subject-grid">
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="اسم المادة" 
                            value={subject.name}
                            onChange={(e) => updateSubject(school.id, schoolClass.id, subject.id, { name: e.target.value })}
                        />
                        <input 
                            type="number" 
                            className="form-control" 
                            placeholder="عدد الطلاب"
                            inputMode="numeric"
                            value={subject.students || ''}
                            onChange={(e) => updateSubject(school.id, schoolClass.id, subject.id, { students: parseInt(e.target.value) || 0 })}
                        />
                        <div className="input-with-symbol">
                            <input 
                                type="number" 
                                className="form-control" 
                                placeholder="نسبة التوزيع"
                                inputMode="numeric"
                                value={subject.distribution || ''}
                                onChange={(e) => updateSubject(school.id, schoolClass.id, subject.id, { distribution: parseInt(e.target.value) || 0 })}
                            />
                            <span className="input-symbol">%</span>
                        </div>
                        <input 
                            type="number" 
                            className="form-control" 
                            placeholder="الكتب بالكرتون"
                            inputMode="numeric"
                            value={subject.booksPerCarton || ''}
                            onChange={(e) => updateSubject(school.id, schoolClass.id, subject.id, { booksPerCarton: parseInt(e.target.value) || 0 })}
                        />
                      {schoolClass.subjects.length > 1 && <button className="remove-btn" onClick={() => handleRemoveSubject(school.id, schoolClass.id, subject.id)}>&times;</button>}
                    </div>
                  ))}
                  
                  <div className="result-header">
                      <h4>النتائج</h4>
                      <div className="toggle-switch">
                          <span className="toggle-label-text">عرض موجز</span>
                          <input
                              type="checkbox"
                              id={`toggle-${schoolClass.id}`}
                              className="toggle-switch-checkbox"
                              checked={classViewModes[schoolClass.id] === 'summary'}
                              onChange={() => handleToggleClassViewMode(schoolClass.id)}
                          />
                          <label htmlFor={`toggle-${schoolClass.id}`} className="toggle-switch-label">
                              <span className="toggle-switch-inner" />
                              <span className="toggle-switch-switch" />
                          </label>
                      </div>
                  </div>
                  <div className="result-box">{calculateClassResult(schoolClass, school, classViewModes[schoolClass.id] || 'detailed')}</div>
                  <button className="btn btn-secondary add-subject-btn" onClick={() => handleAddSubject(school.id, schoolClass.id)}>+ إضافة مادة جديدة</button>
                </div>
              ))}
            </div>
          ))}
          
          <div className="bottom-actions">
              <button className="btn btn-primary" onClick={handleAddSchool}>+ إضافة مدرسة جديدة</button>
              <button 
                  className={`btn btn-secondary ${justAddedClass ? 'btn-added' : ''}`} 
                  onClick={handleAddClassToLastSchool}
                  disabled={justAddedClass}
              >
                  {justAddedClass ? 'تمت الإضافة!' : '+ إضافة صف للمدرسة الأخيرة'}
              </button>
              <button className="btn btn-success" onClick={handleArchive}>أرشفة العملية الحالية</button>
              <div className="export-actions">
                <button className="btn btn-export" onClick={() => exportToExcel()}>تصدير إلى Excel</button>
                <button className="btn btn-word" onClick={() => exportToWord()}>تصدير إلى Word</button>
              </div>
          </div>
        </div>
      )}

      {activeTab === 'log' && (
        <div id="log-content">
          <h2>سجل العمليات المؤرشفة</h2>
          {log.length > 0 ? (
            <>
              <div className="log-list">
                {log.map(entry => (
                  <div key={entry.id} className="log-entry">
                    <div className="log-info">
                      <strong>تاريخ العملية:</strong>
                      <span>{new Date(entry.date).toLocaleString('ar-EG')}</span>
                    </div>
                    <div className="log-actions">
                      <button className="btn btn-export" onClick={() => exportToExcel(entry.data, entry.date)}>تصدير Excel</button>
                      <button className="btn btn-word" onClick={() => exportToWord(entry.data, entry.date)}>تصدير Word</button>
                      <button className="btn btn-danger" onClick={() => handleDeleteLogEntry(entry.id)}>حذف</button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-danger btn-block" onClick={handleClearLog}>مسح السجل بالكامل</button>
            </>
          ) : (
            <p className="empty-log-message">لا توجد عمليات مؤرشفة في السجل حتى الآن.</p>
          )}
        </div>
      )}
      <footer className="footer">
        <p>تم الإنشاء والتطوير بواسطة حارث الغنبوصي</p>
        <p className="contact-info">
            للتواصل: <a href="mailto:harith.qanbosi@gmail.com">harith.qanbosi@gmail.com</a>
        </p>
      </footer>
    </div>
  );
};

export default App;
