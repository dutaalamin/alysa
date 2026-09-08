import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Folder, 
  FolderPlus, 
  FileText, 
  Image as ImageIcon, 
  Sparkles, 
  Trash2, 
  Download,
  ExternalLink, 
  Plus, 
  Search, 
  Grid, 
  List as ListIcon, 
  User, 
  Cloud, 
  Upload, 
  X, 
  Home, 
  ChevronRight, 
  CheckCircle2, 
  Clock,
  BookOpen,
  Calendar,
  MapPin,
  Building2,
  Info,
  Menu,
  SquarePen,
  LogOut,
  LogIn,
  Lock,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient';
import { extractTextFromFile } from './utils/extractor';

// Class Schedule Data transcribed from Alysa's screenshots
const SCHEDULE_DATA = {
  Monday: [
    {
      id: 'm1',
      code: 'LC76 - LEC',
      title: 'Innovative Product Design and Development',
      mode: 'F2F',
      session: 'Session 2',
      time: '08:20 - 10:00 GMT+7',
      location: 'Paskal Campus - 1001',
      tag: 'Onsite Class'
    },
    {
      id: 'm2',
      code: 'BC76 - LAB',
      title: 'Innovative Product Design and Development',
      mode: 'F2F',
      session: 'Session 1',
      time: '10:20 - 12:00 GMT+7',
      location: 'Paskal Campus - 1001',
      tag: 'Onsite Class'
    },
    {
      id: 'm3',
      code: 'LC76 - LEC',
      title: 'Sustainable Entrepreneurship and Social Innovation',
      mode: 'F2F',
      session: 'Session 3',
      time: '14:20 - 16:00 GMT+7',
      location: 'Paskal Campus - 1108',
      tag: 'Onsite Class'
    },
    {
      id: 'm4',
      code: 'LC76 - LEC',
      title: 'Sustainable Entrepreneurship and Social Innovation',
      mode: 'F2F',
      session: 'Session 4',
      time: '16:20 - 18:00 GMT+7',
      location: 'Paskal Campus - 1108',
      tag: 'Onsite Class'
    }
  ],
  Tuesday: [
    {
      id: 't1',
      code: 'LC76 - LEC',
      title: 'Technopreneurship',
      mode: 'F2F',
      session: 'Session 3',
      time: '08:20 - 10:00 GMT+7',
      location: 'Dago Campus - 0205',
      tag: 'Onsite Class'
    },
    {
      id: 't2',
      code: 'LC76 - LEC',
      title: 'Technopreneurship',
      mode: 'F2F',
      session: 'Session 4',
      time: '10:20 - 12:00 GMT+7',
      location: 'Dago Campus - 0205',
      tag: 'Onsite Class'
    }
  ],
  Wednesday: [
    {
      id: 'w1',
      code: 'LC76 - LEC',
      title: 'Omnichannel and Retailing',
      mode: 'F2F',
      session: 'Session 3',
      time: '12:20 - 14:00 GMT+7',
      location: 'Paskal Campus - 0706',
      tag: 'Onsite Class'
    },
    {
      id: 'w2',
      code: 'LC76 - LEC',
      title: 'Omnichannel and Retailing',
      mode: 'F2F',
      session: 'Session 4',
      time: '14:20 - 16:00 GMT+7',
      location: 'Paskal Campus - 0706',
      tag: 'Onsite Class'
    }
  ],
  Thursday: [],
  Friday: [
    {
      id: 'f1',
      code: 'LC76 - LEC',
      title: 'E-Commerce for Entrepreneurs',
      mode: 'F2F',
      session: 'Session 2',
      time: '07:20 - 09:00 GMT+7',
      location: 'Paskal Campus - 1101',
      tag: 'Onsite Class'
    },
    {
      id: 'f2',
      code: 'BC76 - LAB',
      title: 'E-Commerce for Entrepreneurs',
      mode: 'F2F',
      session: 'Session 1',
      time: '09:20 - 11:00 GMT+7',
      location: 'Paskal Campus - 1101',
      tag: 'Onsite Class'
    }
  ]
};

const INITIAL_NOTES = [];
const INITIAL_FOLDERS = [];

// Concept 1: Modern Sleek Minimalist Logo Component for stoody
function StoodyHostingerLogo({ size = 'md', layout = 'horizontal', showSubtitle = false }) {
  const iconContainerClass = size === 'lg' ? 'w-12 h-12 rounded-2xl shadow-md p-2' : size === 'sm' ? 'w-7 h-7 rounded-xl shadow-xs p-1.5' : 'w-9 h-9 rounded-2xl shadow-sm p-1.5';
  const textSizes = size === 'lg' ? 'text-2xl font-extrabold' : size === 'sm' ? 'text-base font-extrabold' : 'text-xl font-extrabold';

  return (
    <div className={`flex ${layout === 'vertical' ? 'flex-col items-center text-center gap-2.5' : 'items-center gap-2.5'}`}>
      <div className={`${iconContainerClass} bg-gradient-to-br from-[#D4A876] to-[#B88652] text-white flex items-center justify-center flex-shrink-0 border border-white/40 transform hover:scale-105 transition-all`}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-white">
          <path 
            d="M 68 28 C 68 18, 32 18, 32 38 C 32 58, 68 46, 68 64 C 68 82, 32 82, 32 72" 
            stroke="currentColor" 
            strokeWidth="14" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className={`text-[#4A3E3C] tracking-tight font-['Plus_Jakarta_Sans',sans-serif] ${textSizes}`}>
          stoody
        </span>
        {showSubtitle && (
          <p className="text-xs text-[#8A7977] font-semibold mt-0.5">
            Ruang Catatan & Materi Kuliah Aesthetic
          </p>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [notes, setNotes] = useState(() => {
    try {
      const cached = localStorage.getItem('alysa_notes_cache');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  const [folders, setFolders] = useState(() => {
    try {
      const cached = localStorage.getItem('alysa_folders_cache');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => {
    // Clear old demo storage items to ensure clean empty state
    localStorage.removeItem('cloudduta_notes');
    localStorage.removeItem('cloudduta_folders');
    localStorage.removeItem('studiyou_notes');
    localStorage.removeItem('studiyou_folders');
  }, []);

  const [activeNav, setActiveNav] = useState('All Files');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [scanningId, setScanningId] = useState(null);
  const [scanStatus, setScanStatus] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // New Note Form
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState('');
  const [newSemester, setNewSemester] = useState('Semester 3');
  const [newContent, setNewContent] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);

  // New Folder Form
  const [newFolderName, setNewFolderName] = useState('');
  const [activeNoteModal, setActiveNoteModal] = useState(null);
  const [isEditingText, setIsEditingText] = useState(false);
  const [editTextContent, setEditTextContent] = useState('');

  // Auth & User States
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  const fileInputRef = useRef(null);

  const getBlobUrlIfNeeded = (url) => {
    if (!url) return '';
    if (url.startsWith('data:')) {
      try {
        const arr = url.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        return URL.createObjectURL(blob);
      } catch (e) {
        return url;
      }
    }
    return url;
  };

  const handleOpenDocument = (url, title = 'Document') => {
    if (!url) return;
    const blobUrl = getBlobUrlIfNeeded(url);
    window.open(blobUrl, '_blank');
  };

  const pdfPreviewUrl = useMemo(() => {
    if (!activeNoteModal) return null;
    const downloadMatch = activeNoteModal.content?.match?.(/📥 DOWNLOAD_URL: (.+)/);
    const downloadUrl = downloadMatch ? downloadMatch[1].trim() : null;
    if (!downloadUrl) return null;
    return getBlobUrlIfNeeded(downloadUrl);
  }, [activeNoteModal?.id, activeNoteModal?.content]);

  const handleDownloadFile = (fileUrlOrData, fileName) => {
    if (!fileUrlOrData) return;
    const blobUrl = getBlobUrlIfNeeded(fileUrlOrData);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCleanNoteContent = (content) => {
    if (!content) return '';
    return content
      .replace(/\n\n📥 DOWNLOAD_URL: .+/g, '')
      .replace(/--- 📑 Extracted Document Text \([^)]+\) ---\n?/gi, '')
      .replace(/--- 📑 Extracted Document Text ---\n?/gi, '')
      .replace(/--- 📑 Hasil Ekstraksi Teks \([^)]+\) ---\n?/gi, '')
      .replace(/--- 📑 Hasil Ekstraksi Teks Dokumen ---\n?/gi, '')
      .replace(/--- 📑 Page \d+ \([^)]+\) ---\n?/gi, '')
      .replace(/--- 📑 Page \d+ ---\n?/gi, '')
      .replace(/--- 📄 Hasil Scan AI \([^)]+\) ---\n?/gi, '')
      .replace(/--- 📄 Hasil Scan AI ---\n?/gi, '')
      .replace(/--- 🖼️ Slide \d+ ---\n?/gi, '')
      .replace(/^\[(PDF File|Photo \/ Image Note|Document File|PowerPoint Presentation|Excel Spreadsheet|DOCX File|TXT File)\] .+\n?/gi, '')
      .replace(/<\/?[a-z0-9:]+[^>]*>/gi, '') // Strip remaining XML tags like <a:pPr>, <p:txBody>
      .trim();
  };

  const handleDownloadTextAsFile = (title, content) => {
    const cleanContent = formatCleanNoteContent(content);
    const blob = new Blob([cleanContent || title], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title || 'note'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveEditedText = async () => {
    if (!activeNoteModal) return;
    const noteId = activeNoteModal.id;

    const downloadMatch = activeNoteModal.content?.match?.(/📥 DOWNLOAD_URL: (.+)/);
    const downloadUrl = downloadMatch ? downloadMatch[1].trim() : null;
    const fileHeaderMatch = activeNoteModal.content?.match(/^\[(PDF File|Photo \/ Image Note|Document File|PowerPoint Presentation|Excel Spreadsheet|DOCX File|TXT File)\] .+/i);
    const fileHeader = fileHeaderMatch ? fileHeaderMatch[0] : null;

    let newFullContent = editTextContent.trim();
    if (downloadUrl) {
      const prefix = fileHeader ? `${fileHeader}\n\n📥 DOWNLOAD_URL: ${downloadUrl}` : `📥 DOWNLOAD_URL: ${downloadUrl}`;
      newFullContent = `${prefix}\n\n${newFullContent}`;
    } else if (fileHeader) {
      newFullContent = `${fileHeader}\n\n${newFullContent}`;
    }

    try {
      await supabase.from('notes').update({ content: newFullContent }).eq('id', noteId);
    } catch (err) {
      console.log('Supabase note text edit notice:', err);
    }

    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, content: newFullContent } : n));
    setActiveNoteModal(prev => ({ ...prev, content: newFullContent }));
    setIsEditingText(false);
  };

  // Listen to Supabase Auth State
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);

    try {
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword
        });
        if (error) throw error;
        setCurrentUser(data.user);
        setIsAuthModalOpen(false);
        setAuthEmail('');
        setAuthPassword('');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            data: { full_name: authName }
          }
        });
        if (error) throw error;
        if (data.user) {
          setCurrentUser(data.user);
          setAuthSuccess('Pendaftaran berhasil! Akun Anda siap digunakan.');
          setTimeout(() => {
            setIsAuthModalOpen(false);
            setAuthSuccess('');
          }, 1200);
        }
      }
    } catch (err) {
      setAuthError(err.message || 'Terjadi kesalahan saat otentikasi');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDemoAccountSwitch = (name, email) => {
    const demoUser = {
      id: `demo-${name.toLowerCase()}`,
      email: email,
      user_metadata: { full_name: name }
    };
    setCurrentUser(demoUser);
    setIsAuthModalOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    setCurrentUser(null);
  };

  const [isCloudConnected, setIsCloudConnected] = useState(true);

  const fetchData = async () => {
    try {
      setIsSyncing(true);

      // Remove auto-created 'General' folder & reset notes course if 'General'
      await supabase.from('folders').delete().eq('name', 'General');
      await supabase.from('notes').update({ course: '' }).eq('course', 'General');

      const { data: notesData, error: notesError } = await supabase.from('notes').select('*').order('created_at', { ascending: false });
      if (!notesError && notesData) {
        setNotes(notesData);
        try {
          localStorage.setItem('alysa_notes_cache', JSON.stringify(notesData));
        } catch (e) {
          console.log('Cache save err:', e);
        }
      }
      
      const { data: foldersData, error: foldersError } = await supabase.from('folders').select('*').order('created_at', { ascending: false });
      if (!foldersError && foldersData) {
        setFolders(foldersData);
        try {
          localStorage.setItem('alysa_folders_cache', JSON.stringify(foldersData));
        } catch (e) {
          console.log('Cache save err:', e);
        }
      }
    } catch (err) {
      console.log('Supabase sync info:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Fetch initial notes & setup Supabase Realtime Subscriptions
  useEffect(() => {
    fetchData();

    // Real-time listener for 'notes' table
    const notesChannel = supabase
      .channel('realtime_notes_live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotes((prev) => {
              if (prev.some(n => n.id === payload.new.id)) return prev;
              return [payload.new, ...prev];
            });
          } else if (payload.eventType === 'DELETE') {
            setNotes((prev) => prev.filter(n => n.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setNotes((prev) => prev.map(n => n.id === payload.new.id ? payload.new : n));
          }
        }
      )
      .subscribe();

    // Real-time listener for 'folders' table
    const foldersChannel = supabase
      .channel('realtime_folders_live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'folders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setFolders((prev) => {
              if (prev.some(f => f.id === payload.new.id)) return prev;
              return [payload.new, ...prev];
            });
          } else if (payload.eventType === 'DELETE') {
            setFolders((prev) => prev.filter(f => f.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Polling backup every 8 seconds for guaranteed live sync
    const pollInterval = setInterval(() => {
      fetchData();
    }, 8000);

    return () => {
      supabase.removeChannel(notesChannel);
      supabase.removeChannel(foldersChannel);
      clearInterval(pollInterval);
    };
  }, []);

  // Continuous local cache updates
  useEffect(() => {
    try {
      if (notes.length > 0) {
        localStorage.setItem('alysa_notes_cache', JSON.stringify(notes));
      }
    } catch (e) {
      console.log('Cache sync notes err:', e);
    }
  }, [notes]);

  useEffect(() => {
    try {
      if (folders.length > 0) {
        localStorage.setItem('alysa_folders_cache', JSON.stringify(folders));
      }
    } catch (e) {
      console.log('Cache sync folders err:', e);
    }
  }, [folders]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const courseName = newCourse.trim() || selectedFolder || '';

    const newNote = {
      id: Date.now().toString(),
      title: newTitle,
      course: courseName,
      semester: newSemester,
      date: new Date().toISOString().split('T')[0],
      size: `${(Math.random() * 1.5 + 0.3).toFixed(1)} MB`,
      pinned: false,
      content: newContent,
      images: uploadedImages,
      ocr_extracted: false
    };

    // Insert to Supabase DB
    await supabase.from('notes').insert([newNote]);
    setNotes(prev => [newNote, ...prev]);
    setIsNoteModalOpen(false);

    // Reset Form
    setNewTitle('');
    setNewCourse('');
    setNewContent('');
    setUploadedImages([]);
    setImageUrlInput('');
  };

  const handleAddFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const newFolderObj = {
      id: `f-${Date.now()}`,
      name: newFolderName.trim()
    };

    await supabase.from('folders').insert([newFolderObj]);
    setFolders(prev => [newFolderObj, ...prev]);
    setNewFolderName('');
    setIsFolderModalOpen(false);
  };

  const handleDeleteNote = async (id) => {
    if (confirm('Delete this note?')) {
      await supabase.from('notes').delete().eq('id', id);
      setNotes(notes.filter(n => n.id !== id));
    }
  };

  const handleDeleteFolder = async (id) => {
    if (confirm('Delete this folder?')) {
      await supabase.from('folders').delete().eq('id', id);
      setFolders(folders.filter(f => f.id !== id));
      if (selectedFolder === folders.find(f => f.id === id)?.name) {
        setSelectedFolder(null);
      }
    }
  };

  // Filter notes
  const filteredNotes = notes.filter(n => {
    const matchesNav = 
      activeNav === 'All Files' ? true :
      activeNav === 'Photos / Slides' ? (n.images && n.images.length > 0) :
      activeNav === 'AI Scan' ? n.ocrExtracted : true;

    const matchesFolder = selectedFolder ? n.course === selectedFolder : true;

    const matchesSearch = 
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase()) ||
      n.course.toLowerCase().includes(search.toLowerCase());

    return matchesNav && matchesFolder && matchesSearch;
  });

  const compressImageAsDataURL = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.75) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawDataUrl = e.target.result;
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = () => resolve(rawDataUrl);
        img.src = rawDataUrl;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const readDocumentAsDataURL = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e) => {
    const filesList = e.target.files || e.dataTransfer?.files;
    if (!filesList || filesList.length === 0) return;

    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      const isImg = file.type.startsWith('image/');
      const ext = file.name.split('.').pop().toLowerCase();
      
      let fileTypeLabel = 'Document File';
      if (['ppt', 'pptx'].includes(ext)) fileTypeLabel = 'PowerPoint Presentation';
      else if (['xls', 'xlsx', 'csv'].includes(ext)) fileTypeLabel = 'Excel Spreadsheet';
      else if (['txt', 'pdf', 'doc', 'docx'].includes(ext)) fileTypeLabel = `${ext.toUpperCase()} File`;
      else if (isImg) fileTypeLabel = 'Photo / Image Note';

      let imageArray = [];
      let contentText = `[${fileTypeLabel}] ${file.name}`;
      let filePublicUrl = null;

      // Try uploading to Supabase Storage first
      try {
        const storagePath = `uploads/${Date.now()}_${i}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('notes-files')
          .upload(storagePath, file, { upsert: true });

        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage.from('notes-files').getPublicUrl(storagePath);
          if (urlData?.publicUrl) {
            filePublicUrl = urlData.publicUrl;
          }
        }
      } catch (storageErr) {
        console.log('Storage upload skipped:', storageErr);
      }

      if (isImg) {
        if (filePublicUrl) {
          // Use the permanent storage URL
          imageArray = [filePublicUrl];
        } else {
          // Fallback: compress to Data URL
          const dataUrl = await compressImageAsDataURL(file);
          if (dataUrl) {
            imageArray = [dataUrl];
          }
        }
      } else {
        // For documents (PPT, PDF, Word, Excel, etc.)
        if (!filePublicUrl) {
          filePublicUrl = await readDocumentAsDataURL(file);
        }
        if (filePublicUrl) {
          contentText = `[${fileTypeLabel}] ${file.name}\n\n📥 DOWNLOAD_URL: ${filePublicUrl}`;
        }
        // Auto extract text content from document upon upload
        try {
          const autoExtracted = await extractTextFromFile(file, file.name);
          if (autoExtracted && !autoExtracted.startsWith('(')) {
            contentText += `\n\n` + autoExtracted;
          }
        } catch (autoErr) {
          console.log('Auto document extraction notice:', autoErr);
        }
      }

      // Only use columns that exist in the Supabase notes table
      const newNote = {
        id: (Date.now() + i).toString(),
        title: file.name,
        course: selectedFolder || '',
        semester: 'Semester 3',
        date: new Date().toISOString().split('T')[0],
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        pinned: false,
        content: contentText,
        images: imageArray,
        ocr_extracted: false
      };

      const { error: insertError } = await supabase.from('notes').insert([newNote]);
      if (insertError) {
        console.error('Supabase insert error:', insertError);
      }
      setNotes(prev => [newNote, ...prev]);
    }
  };

  const handleRealAIScan = async (note) => {
    if (!note) return;
    const noteId = note.id;
    setScanningId(noteId);
    setScanStatus(prev => ({ ...prev, [noteId]: 'Menganalisis file...' }));

    try {
      let extractedCombined = '';

      // 1. Process attached images via Tesseract OCR
      if (note.images && note.images.length > 0) {
        for (let i = 0; i < note.images.length; i++) {
          const imgUrl = note.images[i];
          const text = await extractTextFromFile(imgUrl, `${note.title || 'image'}.jpg`, (msg) => {
            setScanStatus(prev => ({ ...prev, [noteId]: msg }));
          });
          if (text) {
            extractedCombined += (extractedCombined ? '\n\n' : '') + text;
          }
        }
      }

      // 2. Process attached Document (PDF, Word, Excel, PPTX, TXT) if download URL exists
      const downloadMatch = note.content?.match?.(/📥 DOWNLOAD_URL: (.+)/);
      const downloadUrl = downloadMatch ? downloadMatch[1].trim() : null;

      if (downloadUrl) {
        const text = await extractTextFromFile(downloadUrl, note.title, (msg) => {
          setScanStatus(prev => ({ ...prev, [noteId]: msg }));
        });
        if (text) {
          extractedCombined += (extractedCombined ? '\n\n' : '') + text;
        }
      } else if (!note.images || note.images.length === 0) {
        // If file has no URL or images (e.g. older upload), open file picker to extract
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,image/*';
        input.onchange = async (e) => {
          const selectedFile = e.target.files?.[0];
          if (selectedFile) {
            setScanStatus(prev => ({ ...prev, [noteId]: 'Membaca file...' }));
            try {
              const text = await extractTextFromFile(selectedFile, selectedFile.name, (msg) => {
                setScanStatus(prev => ({ ...prev, [noteId]: msg }));
              });
              if (text) {
                const updatedContent = `${note.content || ''}\n\n${text}`;
                await supabase.from('notes').update({ content: updatedContent, ocr_extracted: true }).eq('id', noteId);
                setNotes(prev => prev.map(n => n.id === noteId ? { ...n, content: updatedContent } : n));
                if (activeNoteModal && activeNoteModal.id === noteId) {
                  setActiveNoteModal(prev => ({ ...prev, content: updatedContent }));
                }
              }
            } catch (err) {
              alert('Gagal mengekstrak file: ' + err.message);
            }
          }
          setScanningId(null);
          setScanStatus(prev => ({ ...prev, [noteId]: null }));
        };
        input.click();
        return;
      }

      if (!extractedCombined) {
        extractedCombined = '(Tidak ada teks yang dapat diekstrak dari file ini)';
      }

      const fileHeader = note.content?.split('\n\n')?.[0] || `[Document File] ${note.title}`;
      const updatedContent = downloadUrl
        ? `${fileHeader}\n\n📥 DOWNLOAD_URL: ${downloadUrl}\n\n${extractedCombined}`
        : extractedCombined;

      // Update Supabase Database
      try {
        await supabase
          .from('notes')
          .update({ content: updatedContent, ocr_extracted: true })
          .eq('id', noteId);
      } catch (dbErr) {
        console.log('Supabase OCR update notice:', dbErr);
      }

      // Update Local React State
      setNotes(prev =>
        prev.map(n =>
          n.id === noteId
            ? { ...n, content: updatedContent, ocrExtracted: true, ocr_extracted: true }
            : n
        )
      );

      if (activeNoteModal && activeNoteModal.id === noteId) {
        setActiveNoteModal(prev => ({
          ...prev,
          content: updatedContent,
          ocrExtracted: true,
          ocr_extracted: true
        }));
      }
    } catch (err) {
      console.error('Text extraction error:', err);
      alert('Gagal mengekstrak teks dari file: ' + (err.message || err));
    } finally {
      setScanningId(null);
      setScanStatus(prev => ({ ...prev, [noteId]: null }));
    }
  };

  const handleAttachFileToNote = (note) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,image/*';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        setScanningId(note.id);
        setScanStatus(prev => ({ ...prev, [note.id]: 'Mengunggah & membaca file...' }));
        
        let filePublicUrl = null;
        try {
          const storagePath = `uploads/${Date.now()}_${file.name}`;
          const { data: uploadData } = await supabase.storage.from('notes-files').upload(storagePath, file, { upsert: true });
          if (uploadData) {
            const { data: urlData } = supabase.storage.from('notes-files').getPublicUrl(storagePath);
            filePublicUrl = urlData?.publicUrl || null;
          }
        } catch (storageErr) {
          console.log('Storage notice:', storageErr);
        }

        if (!filePublicUrl) {
          filePublicUrl = await readDocumentAsDataURL(file);
        }

        let updatedContent = `[Document File] ${file.name}\n\n📥 DOWNLOAD_URL: ${filePublicUrl}`;
        try {
          const extractedText = await extractTextFromFile(file, file.name);
          if (extractedText && !extractedText.startsWith('(')) {
            updatedContent += `\n\n` + extractedText;
          }
        } catch (err) {
          console.log('Extract error:', err);
        } finally {
          setScanningId(null);
          setScanStatus(prev => ({ ...prev, [note.id]: null }));
        }

        await supabase.from('notes').update({ content: updatedContent, ocr_extracted: true }).eq('id', note.id);
        setNotes(prev => prev.map(n => n.id === note.id ? { ...n, content: updatedContent, ocrExtracted: true } : n));
        if (activeNoteModal && activeNoteModal.id === note.id) {
          setActiveNoteModal(prev => ({ ...prev, content: updatedContent, ocrExtracted: true }));
        }
      }
    };
    input.click();
  };

  const totalClassesCount = Object.values(SCHEDULE_DATA).flat().length;

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-[#FFF9F2] text-[#4A3E3C] overflow-hidden font-sans">
      
      {/* MOBILE TOP HEADER BAR (Mobile screens only) */}
      <div className="flex md:hidden items-center justify-between p-4 bg-[#FAF4EC] border-b border-[#E8DAC8]">
        <StoodyHostingerLogo size="sm" />

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 bg-white border border-[#E8DAC8] px-2.5 py-1 rounded-full text-xs font-extrabold text-[#4A3E3C] shadow-xs active:scale-95"
          >
            <span>{currentUser?.user_metadata?.full_name ? '👤 ' + currentUser.user_metadata.full_name : '🔑 Login'}</span>
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-white border border-[#E8DAC8] text-[#4A3E3C] shadow-sm"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER NAVIGATION MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -280 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -280 }}
            className="fixed inset-0 z-40 bg-[#4A3E3C]/30 backdrop-blur-sm md:hidden flex"
          >
            <div className="w-[280px] bg-[#FAF4EC] h-full p-5 flex flex-col justify-between border-r border-[#E8DAC8] shadow-xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#C89B68] flex items-center justify-center text-white shadow-sm">
                      <BookOpen size={16} className="fill-white/20" />
                    </div>
                    <h1 className="text-lg font-extrabold text-[#4A3E3C]">Stoody</h1>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="text-[#8A7977]">
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => { fileInputRef.current?.click(); setIsMobileMenuOpen(false); }}
                    className="w-full bg-[#C89B68] text-white font-bold text-xs py-3 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    <span>Add Files</span>
                  </button>
                  <button
                    onClick={() => { setIsFolderModalOpen(true); setIsMobileMenuOpen(false); }}
                    className="w-full bg-[#FAF0E6] text-[#4A3E3C] border border-[#E8DAC8] font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2"
                  >
                    <FolderPlus size={15} className="text-[#C89B68]" />
                    <span>New Folder</span>
                  </button>
                </div>

                <nav className="space-y-1 pt-2">
                  {[
                    { label: 'All Files', icon: FileText, type: 'nav' },
                    { label: 'New Note', icon: SquarePen, type: 'action' },
                    { label: 'Class Schedule', icon: Calendar, type: 'nav' }
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = item.type === 'nav' && activeNav === item.label && !selectedFolder;
                    return (
                      <button
                        key={item.label}
                        onClick={() => {
                          if (item.type === 'action') {
                            setIsNoteModalOpen(true);
                          } else {
                            setActiveNav(item.label);
                            setSelectedFolder(null);
                          }
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          isActive 
                            ? 'bg-[#F3E5D8] text-[#8C5E32] shadow-sm' 
                            : 'text-[#8A7977] hover:bg-[#F7EFE5] hover:text-[#4A3E3C]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon size={16} className={isActive ? 'text-[#8C5E32]' : 'text-[#8A7977]'} />
                          <span>{item.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="bg-[#FAF0E6] border border-[#E8DAC8] rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#8A7977] flex items-center gap-1.5">
                    <BookOpen size={14} className="text-[#C89B68]" />
                    Note Storage
                  </span>
                  <span className="font-bold text-[#8C5E32]">0% used</span>
                </div>
                <div className="w-full h-1.5 bg-[#E8DAC8] rounded-full overflow-hidden">
                  <div className="h-full bg-[#C89B68] w-[2%] rounded-full"></div>
                </div>
                <p className="text-[10px] text-[#8A7977] font-medium flex items-center gap-1">
                  <CheckCircle2 size={11} className="text-[#8C5E32]" />
                  Storage Connected
                </p>
              </div>
            </div>

            <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)}></div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* DESKTOP SIDEBAR (Cream Theme - hidden on mobile) */}
      <aside className="hidden md:flex w-[280px] bg-[#FAF4EC]/90 border-r border-[#E8DAC8] p-5 flex-col justify-between shadow-sm backdrop-blur-md">
        <div className="space-y-6">
          
          {/* Logo Header */}
          <StoodyHostingerLogo size="md" />

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-[#C89B68] hover:bg-[#B88B58] text-white font-bold text-xs py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Plus size={16} />
              <span>Add Files</span>
            </button>

            <button
              onClick={() => setIsFolderModalOpen(true)}
              className="w-full bg-[#FAF0E6] hover:bg-[#F3E5D8] text-[#4A3E3C] border border-[#E8DAC8] font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <FolderPlus size={15} className="text-[#C89B68]" />
              <span>New Folder</span>
            </button>
          </div>

          {/* Side Navigation Items */}
          <nav className="space-y-1 pt-2">
            {[
              { label: 'All Files', icon: FileText, type: 'nav' },
              { label: 'New Note', icon: SquarePen, type: 'action' },
              { label: 'Class Schedule', icon: Calendar, type: 'nav' }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = item.type === 'nav' && activeNav === item.label && !selectedFolder;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    if (item.type === 'action') {
                      setIsNoteModalOpen(true);
                    } else {
                      setActiveNav(item.label);
                      setSelectedFolder(null);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive 
                      ? 'bg-[#F3E5D8] text-[#8C5E32] shadow-sm' 
                      : 'text-[#8A7977] hover:bg-[#F7EFE5] hover:text-[#4A3E3C]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className={isActive ? 'text-[#8C5E32]' : 'text-[#8A7977]'} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Storage Card Widget */}
        <div className="bg-[#FAF0E6] border border-[#E8DAC8] rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#8A7977] flex items-center gap-1.5">
              <BookOpen size={14} className="text-[#C89B68]" />
              Note Storage
            </span>
            <span className="font-bold text-[#8C5E32]">0% used</span>
          </div>

          <div className="w-full h-1.5 bg-[#E8DAC8] rounded-full overflow-hidden">
            <div className="h-full bg-[#C89B68] w-[2%] rounded-full"></div>
          </div>

          <p className="text-[10px] text-[#8A7977] font-medium flex items-center gap-1">
            <CheckCircle2 size={11} className="text-[#8C5E32]" />
            Storage Connected
          </p>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
        
        {/* Top Header Bar */}
        <header className="flex items-center justify-between gap-4">
          
          {/* Search Bar */}
          <div className="relative w-full max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8A7977]" />
            <input
              type="text"
              placeholder="Search notes, courses..."
              className="w-full bg-white border border-[#E8DAC8] rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-[#4A3E3C] focus:outline-none focus:ring-2 focus:ring-[#C89B68]/30 focus:border-[#C89B68] transition-all shadow-sm placeholder-[#8A7977]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Header Controls & User Profile (Alysa) */}
          <div className="flex items-center gap-3">
            
            {/* View Mode Toggle */}
            <div className="flex bg-white border border-[#E8DAC8] rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'grid' ? 'bg-[#F3E5D8] text-[#8C5E32]' : 'text-[#8A7977] hover:text-[#4A3E3C]'
                }`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'list' ? 'bg-[#F3E5D8] text-[#8C5E32]' : 'text-[#8A7977] hover:text-[#4A3E3C]'
                }`}
              >
                <ListIcon size={16} />
              </button>
            </div>

            {/* Cloud Sync Status Indicator */}
            <div className="flex items-center gap-1.5 bg-[#FAF0E6] border border-[#E8DAC8] px-3 py-1.5 rounded-full text-[11px] font-bold text-[#8C5E32] shadow-sm">
              <Cloud size={13} className={isSyncing ? "animate-pulse text-[#C89B68]" : "text-[#8C5E32]"} />
              <span>{isSyncing ? 'Syncing...' : 'Cloud Synced'}</span>
            </div>

            {/* User Profile Badge (Desktop) */}
            <div className="hidden md:flex items-center gap-2 bg-white border border-[#E8DAC8] px-3.5 py-1.5 rounded-full shadow-sm">
              <div className="w-7 h-7 rounded-full bg-[#F3E5D8] text-[#8C5E32] flex items-center justify-center text-xs font-bold">
                {currentUser?.user_metadata?.full_name ? currentUser.user_metadata.full_name[0].toUpperCase() : '👤'}
              </div>
              <span className="text-xs font-extrabold text-[#4A3E3C]">
                {currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'Mode Demo'}
              </span>
              {currentUser ? (
                <button 
                  onClick={handleSignOut} 
                  title="Keluar / Sign Out"
                  className="text-xs font-bold text-[#A04040] hover:bg-[#FDF0F0] p-1.5 rounded-full ml-1 transition-all"
                >
                  <LogOut size={13} />
                </button>
              ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-[11px] font-bold text-white bg-[#C89B68] hover:bg-[#B88B58] px-2.5 py-1 rounded-lg ml-1 shadow-xs transition-all flex items-center gap-1 active:scale-95"
                >
                  <LogIn size={12} />
                  <span>Masuk</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-bold text-[#8A7977]">
          <button 
            onClick={() => { setSelectedFolder(null); setActiveNav('All Files'); }}
            className="hover:text-[#8C5E32] flex items-center gap-1 transition-colors"
          >
            <Home size={14} />
            <span>Root</span>
          </button>

          {activeNav === 'Class Schedule' ? (
            <>
              <ChevronRight size={14} className="text-[#C8B8A6]" />
              <span className="text-[#8C5E32]">Class Schedule</span>
            </>
          ) : selectedFolder ? (
            <>
              <ChevronRight size={14} className="text-[#C8B8A6]" />
              <span className="text-[#8C5E32]">{selectedFolder}</span>
            </>
          ) : null}
        </div>

        {/* CLASS SCHEDULE VIEW */}
        {activeNav === 'Class Schedule' ? (
          <div className="space-y-5">
            {/* Header Title */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-[#4A3E3C]">
                  Alysa's Class Schedule 📅
                </h2>
                <p className="text-xs text-[#8A7977]">
                  Weekly course timetable (Monday - Friday)
                </p>
              </div>
            </div>

            {/* Days Selector Tabs */}
            <div className="flex bg-white border border-[#E8DAC8] p-1.5 rounded-2xl gap-1.5 shadow-sm overflow-x-auto">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                const isSelected = selectedDay === day;
                const classCount = SCHEDULE_DATA[day]?.length || 0;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                      isSelected 
                        ? 'bg-[#C89B68] text-white shadow-sm' 
                        : 'text-[#8A7977] hover:bg-[#FAF0E6] hover:text-[#4A3E3C]'
                    }`}
                  >
                    <span>{day}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-[#F3E5D8] text-[#8C5E32]'
                    }`}>
                      {classCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Classes List Card timeline for selected day */}
            <div className="space-y-4">
              {SCHEDULE_DATA[selectedDay] && SCHEDULE_DATA[selectedDay].length > 0 ? (
                SCHEDULE_DATA[selectedDay].map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-[#E8DAC8] rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#C89B68] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      {/* Badge tags */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#F3E5D8] text-[#8C5E32]">
                          {item.code}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#E8DAC8] text-[#8A7977]">
                          {item.tag}
                        </span>
                      </div>

                      {/* Course Title */}
                      <h3 className="text-sm font-extrabold text-[#4A3E3C]">
                        {item.title}
                      </h3>

                      {/* Session Info */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#8A7977] font-semibold pt-1">
                        <span className="flex items-center gap-1.5">
                          <Info size={13} className="text-[#C89B68]" />
                          {item.mode} • {item.session}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={13} className="text-[#C89B68]" />
                          {item.time}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-[#C89B68]" />
                          {item.location}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center bg-white border border-[#E8DAC8] rounded-2xl p-8 max-w-sm mx-auto shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-[#F3E5D8] text-[#8C5E32] mx-auto flex items-center justify-center text-xl mb-3">
                    ☕
                  </div>
                  <h3 className="font-bold text-[#4A3E3C] text-sm mb-1">No Classes Scheduled</h3>
                  <p className="text-xs text-[#8A7977]">Free day / self-study time for {selectedDay}.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* STANDARD NOTES & FOLDERS VIEW */
          <>
            {/* Dropzone Upload Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFileUpload(e);
              }}
              className={`border-2 dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                isDragging 
                  ? 'border-[#C89B68] bg-[#FAF0E6]' 
                  : 'border-[#E8DAC8] bg-white/70 hover:border-[#C89B68] hover:bg-[#FAF4EC]'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".ppt,.pptx,.xls,.xlsx,.csv,.doc,.docx,.pdf,.txt,image/*"
                multiple
                className="hidden"
              />
              <div className="w-10 h-10 rounded-xl bg-[#F3E5D8] text-[#8C5E32] flex items-center justify-center">
                <Upload size={20} />
              </div>
              <p className="text-xs font-extrabold text-[#4A3E3C]">
                Drop files or documents here to upload
              </p>
              <p className="text-[10px] text-[#8A7977]">
                Upload note photos or course documents
              </p>
            </div>

            {/* Unified Folders & Files Section */}
            <div className="space-y-4">
              {/* Breadcrumb Header when viewing inside a specific folder */}
              {selectedFolder && (
                <div className="flex items-center justify-between bg-white border border-[#E8DAC8] rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedFolder(null)}
                      className="text-xs font-extrabold text-[#8C5E32] hover:underline flex items-center gap-1 bg-[#FAF0E6] px-2.5 py-1 rounded-lg"
                    >
                      ← Home
                    </button>
                    <span className="text-[#8A7977] font-bold text-xs">/</span>
                    <div className="flex items-center gap-1.5 font-extrabold text-[#4A3E3C] text-sm">
                      <Folder size={16} className="text-[#C89B68]" />
                      <span>{selectedFolder}</span>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-[#8A7977]">
                    {filteredNotes.length} {filteredNotes.length === 1 ? 'File' : 'Files'}
                  </span>
                </div>
              )}

              {/* Combined Content Grid */}
              {(() => {
                const currentFolders = selectedFolder
                  ? []
                  : folders.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

                const hasItems = currentFolders.length > 0 || filteredNotes.length > 0;

                if (!hasItems) {
                  return (
                    <div className="py-16 text-center bg-white border border-[#E8DAC8] rounded-2xl p-8 max-w-sm mx-auto shadow-sm">
                      <div className="w-12 h-12 rounded-full bg-[#F3E5D8] text-[#8C5E32] mx-auto flex items-center justify-center text-xl mb-3">
                        📂
                      </div>
                      <h3 className="font-bold text-[#4A3E3C] text-sm mb-1">
                        {selectedFolder ? `Folder "${selectedFolder}" is empty` : 'No files or folders found'}
                      </h3>
                      <p className="text-xs text-[#8A7977] mb-4">
                        Upload files above or click below to create a note or folder.
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setIsNoteModalOpen(true)}
                          className="bg-[#C89B68] hover:bg-[#B88B58] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                        >
                          <Plus size={14} />
                          <span>New Note</span>
                        </button>
                        <button
                          onClick={() => setIsFolderModalOpen(true)}
                          className="bg-[#FAF0E6] hover:bg-[#F3E5D8] text-[#4A3E3C] border border-[#E8DAC8] font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
                        >
                          <FolderPlus size={14} className="text-[#C89B68]" />
                          <span>New Folder</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5' : 'space-y-3'}>
                    <AnimatePresence>
                      {/* Render Folder Cards */}
                      {currentFolders.map((f) => {
                        const folderNoteCount = notes.filter(n => n.course === f.name).length;
                        return (
                          <motion.div
                            key={f.id}
                            layout
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            onClick={() => setSelectedFolder(f.name)}
                            className="bg-white border border-[#E8DAC8] rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-[#C89B68] transition-all flex flex-col justify-between group cursor-pointer"
                          >
                            <div>
                              {/* Big Folder Icon Banner */}
                              <div className="h-28 rounded-xl bg-[#FAF0E6] flex items-center justify-center mb-3 group-hover:bg-[#F3E5D8] transition-colors relative">
                                <Folder size={44} className="fill-[#C89B68]/30 text-[#C89B68] group-hover:scale-105 transition-transform duration-200" />

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteFolder(f.id);
                                  }}
                                  className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white rounded-lg text-[#8A7977] hover:text-[#A04040] opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                  title="Delete folder"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>

                              {/* Folder Title */}
                              <h3 className="font-extrabold text-[#4A3E3C] text-sm mb-1 truncate group-hover:text-[#8C5E32] transition-colors">
                                {f.name}
                              </h3>
                              <p className="text-[10px] font-semibold text-[#8A7977]">
                                {folderNoteCount} {folderNoteCount === 1 ? 'file' : 'files'}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}

                      {/* Render Note / File Cards */}
                      {filteredNotes.map((note) => (
                        <motion.div
                          key={note.id}
                          layout
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          onClick={() => {
                            setActiveNoteModal(note);
                            setIsEditingText(false);
                          }}
                          className="bg-white border border-[#E8DAC8] rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-[#C89B68] transition-all flex flex-col justify-between group cursor-pointer"
                        >
                          <div>
                            {/* Header Card */}
                            <div className="flex items-center justify-between mb-2">
                              {note.course ? (
                                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#F3E5D8] text-[#8C5E32]">
                                  {note.course}
                                </span>
                              ) : <span />}

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNote(note.id);
                                }}
                                className="p-1 text-[#8A7977] hover:text-[#A04040] rounded-full transition-colors"
                                title="Delete note"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>

                            {/* Title */}
                            <h3 className="font-extrabold text-[#4A3E3C] text-sm mb-2 line-clamp-2 group-hover:text-[#8C5E32] transition-colors">
                              {note.title}
                            </h3>

                            {/* Document Download & Open Widget */}
                            {(() => {
                              const downloadMatch = note.content?.match?.(/📥 DOWNLOAD_URL: (.+)/);
                              const downloadUrl = downloadMatch ? downloadMatch[1].trim() : null;
                              const fileExt = note.title?.split('.').pop()?.toLowerCase() || '';
                              const isDocument = ['ppt','pptx','pdf','doc','docx','xls','xlsx','csv','txt'].includes(fileExt);

                              if (downloadUrl) {
                                return (
                                  <div className="mb-3 p-3 bg-[#FAF0E6] border border-[#E8DAC8] rounded-xl space-y-2">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-lg bg-[#C89B68] text-white flex items-center justify-center font-extrabold text-[10px] shadow-sm uppercase">
                                        {fileExt || 'FILE'}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-extrabold text-[#4A3E3C] truncate">{note.title}</p>
                                        <p className="text-[10px] text-[#8A7977] font-semibold">{note.size}</p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-1">
                                      <a
                                        href={downloadUrl}
                                        download={note.title}
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex-1 bg-[#C89B68] hover:bg-[#B88B58] text-white text-[11px] font-bold py-1.5 px-3 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
                                      >
                                        <Download size={13} />
                                        <span>Download</span>
                                      </a>

                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenDocument(downloadUrl, note.title);
                                        }}
                                        className="bg-white hover:bg-[#F7EFE5] border border-[#E8DAC8] text-[#8C5E32] text-[11px] font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                      >
                                        <ExternalLink size={13} />
                                        <span>Open</span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              } else if (isDocument && !note.images?.length) {
                                return (
                                  <div className="mb-3 p-3 bg-[#FAF0E6] border border-[#E8DAC8] rounded-xl">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-lg bg-[#C89B68]/70 text-white flex items-center justify-center font-extrabold text-[10px] shadow-sm uppercase">
                                        {fileExt}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-[#4A3E3C] truncate">{note.title}</p>
                                        <p className="text-[10px] text-[#8A7977]">Click card to view details</p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            })()}

                            {/* Photo Preview if exists */}
                            {note.images && note.images.length > 0 && (
                              <div className="mb-3">
                                {note.images.map((img, i) => (
                                  <div
                                    key={i}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPreviewImage(img);
                                    }}
                                    className="relative h-36 rounded-xl overflow-hidden cursor-pointer border border-[#E8DAC8] group/img"
                                  >
                                    <img
                                      src={img}
                                      alt="Note Photo"
                                      loading="eager"
                                      decoding="async"
                                      className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300 bg-[#F7EFE5]"
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-between p-2 text-white">
                                      <span className="flex items-center gap-1 text-xs font-bold bg-black/40 px-2 py-1 rounded-lg backdrop-blur-xs">
                                        <ImageIcon size={14} />
                                        <span>View</span>
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDownloadFile(img, `${note.title || 'image'}.jpg`);
                                        }}
                                        className="bg-[#C89B68] hover:bg-[#B88B58] text-white p-1.5 rounded-lg shadow-md flex items-center gap-1 text-[10px] font-bold active:scale-95"
                                        title="Download Image"
                                      >
                                        <Download size={13} />
                                        <span>Download</span>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Text Preview (extended line-clamp and cleaner font) */}
                            <p className="text-xs text-[#8A7977] whitespace-pre-line leading-relaxed line-clamp-6 font-medium">
                              {formatCleanNoteContent(note.content)}
                            </p>
                          </div>

                          {/* Footer Card */}
                          <div className="mt-4 pt-3 border-t border-[#F3E5D8] flex items-center justify-between">
                            <span className="text-[10px] text-[#8A7977] font-semibold flex items-center gap-1">
                              <Clock size={12} />
                              {note.date} • {note.size}
                            </span>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadTextAsFile(note.title, note.content);
                                }}
                                className="text-[10px] font-bold text-[#8C5E32] bg-[#FAF0E6] hover:bg-[#F3E5D8] border border-[#E8DAC8] px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                                title="Download note as .txt file"
                              >
                                <Download size={11} />
                                <span>.txt</span>
                              </button>

                              {((note.images && note.images.length > 0) || note.content?.includes('DOWNLOAD_URL')) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRealAIScan(note);
                                  }}
                                  disabled={scanningId === note.id}
                                  className="text-[10px] font-bold text-[#8C5E32] bg-[#F3E5D8] hover:bg-[#E8D4C1] px-2.5 py-0.5 rounded-full flex items-center gap-1 transition-colors disabled:opacity-50"
                                >
                                  <Sparkles size={11} className={scanningId === note.id ? 'animate-spin' : ''} />
                                  <span>{scanningId === note.id ? (scanStatus[note.id] || 'Scanning...') : 'AI Scan'}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                );
              })()}
            </div>
          </>
        )}
      </main>

      {/* MODAL: Add New Note */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#4A3E3C]/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8DAC8] rounded-3xl shadow-xl w-full max-w-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#F3E5D8] pb-3">
              <h3 className="font-extrabold text-[#4A3E3C] text-base">New Note ✏️</h3>
              <button onClick={() => setIsNoteModalOpen(false)} className="text-[#8A7977] hover:text-[#4A3E3C]">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddNote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#8A7977] mb-1.5">Title</label>
                <input
                  type="text"
                  placeholder="Judul catatan..."
                  required
                  className="w-full bg-[#FAF4EC] border border-[#E8DAC8] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#4A3E3C] focus:outline-none focus:border-[#C89B68] focus:ring-1 focus:ring-[#C89B68]/30 transition-all"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8A7977] mb-1.5">Content</label>
                <textarea
                  rows={10}
                  placeholder="Tulis isi catatan di sini..."
                  className="w-full bg-[#FAF4EC] border border-[#E8DAC8] rounded-xl p-3.5 text-sm font-medium text-[#4A3E3C] focus:outline-none focus:border-[#C89B68] focus:ring-1 focus:ring-[#C89B68]/30 transition-all resize-y min-h-[220px] max-h-[50vh]"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                />
              </div>

              <div className="pt-1 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#8A7977] hover:bg-[#FAF4EC] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#C89B68] hover:bg-[#B88B58] text-white text-xs font-bold shadow-sm transition-all active:scale-95"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Course Folder */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#4A3E3C]/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8DAC8] rounded-3xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F3E5D8] pb-3">
              <h3 className="font-extrabold text-[#4A3E3C] text-base">Add Course Folder 📁</h3>
              <button onClick={() => setIsFolderModalOpen(false)} className="text-[#8A7977]">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddFolder} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#8A7977] mb-1">Course Folder Name</label>
                <input
                  type="text"
                  placeholder="e.g. Web Development..."
                  required
                  className="w-full bg-[#FAF4EC] border border-[#E8DAC8] rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFolderModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#8A7977]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#C89B68] text-white text-xs font-bold"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Fullscreen Image Preview */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-[#4A3E3C]/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={previewImage} alt="Photo Preview" className="w-full h-full object-contain rounded-2xl shadow-2xl" />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-white/80 text-[#4A3E3C] p-2 rounded-full font-bold shadow-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Full Note Detail & Download View */}
      {activeNoteModal && (
        <div
          onClick={() => setActiveNoteModal(null)}
          className="fixed inset-0 z-50 bg-[#4A3E3C]/40 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#E8DAC8] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col p-6 space-y-4 overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#F3E5D8] pb-4">
              <div className="space-y-1 pr-4">
                <div className="flex items-center gap-2">
                  {activeNoteModal.course ? (
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#F3E5D8] text-[#8C5E32]">
                      {activeNoteModal.course}
                    </span>
                  ) : null}
                  <span className="text-[11px] font-semibold text-[#8A7977]">
                    {activeNoteModal.date} • {activeNoteModal.size}
                  </span>
                </div>
                <h2 className="font-extrabold text-[#4A3E3C] text-lg leading-snug">
                  {activeNoteModal.title}
                </h2>
              </div>

              <button
                onClick={() => setActiveNoteModal(null)}
                className="p-1.5 rounded-xl hover:bg-[#FAF4EC] text-[#8A7977] hover:text-[#4A3E3C] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Attached Images */}
              {activeNoteModal.images && activeNoteModal.images.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8A7977]">Attached Photos ({activeNoteModal.images.length})</span>
                    <button
                      onClick={() => handleRealAIScan(activeNoteModal)}
                      disabled={scanningId === activeNoteModal.id}
                      className="bg-[#F3E5D8] hover:bg-[#E8D4C1] text-[#8C5E32] text-xs font-extrabold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Sparkles size={14} className={scanningId === activeNoteModal.id ? 'animate-spin' : ''} />
                      <span>
                        {scanningId === activeNoteModal.id
                          ? (scanStatus[activeNoteModal.id] || 'Scanning...')
                          : 'Extract Text with AI (Free)'}
                      </span>
                    </button>
                  </div>
                  {activeNoteModal.images.map((img, idx) => (
                    <div key={idx} className="relative rounded-2xl overflow-hidden border border-[#E8DAC8] bg-[#F7EFE5]">
                      <img
                        src={img}
                        alt="Note Attachment"
                        className="w-full h-auto max-h-[400px] object-contain mx-auto"
                      />
                      <button
                        onClick={() => handleDownloadFile(img, `${activeNoteModal.title}_image_${idx + 1}.jpg`)}
                        className="absolute bottom-3 right-3 bg-[#C89B68] hover:bg-[#B88B58] text-white text-xs font-bold py-2 px-3.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <Download size={14} />
                        <span>Download Image</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* PDF & Document Live Preview and AI Text Extractor Bar */}
              {(() => {
                const fileExt = activeNoteModal.title?.split('.').pop()?.toLowerCase() || '';
                const downloadMatch = activeNoteModal.content?.match?.(/📥 DOWNLOAD_URL: (.+)/);
                const downloadUrl = downloadMatch ? downloadMatch[1].trim() : null;
                const isPdf = fileExt === 'pdf';
                const isDoc = ['pdf','doc','docx','ppt','pptx','xls','xlsx','csv','txt'].includes(fileExt);
                const isTxtOrPlainNote = fileExt === 'txt' || !fileExt || !['pdf','doc','docx','ppt','pptx','xls','xlsx','jpg','jpeg','png','webp'].includes(fileExt);
                const showDocControlWidget = downloadUrl || (!isTxtOrPlainNote && ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(fileExt));

                return (
                  <div className="space-y-3">
                    {/* Live Document Preview (PDF native iframe or Office Docs Viewer for PPT/Word/Excel) */}
                    {downloadUrl && (
                      <>
                        {isPdf && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#8A7977]">📑 PDF Live Preview</span>
                              <button
                                onClick={() => handleOpenDocument(downloadUrl, activeNoteModal.title)}
                                className="text-[11px] font-bold text-[#8C5E32] hover:underline flex items-center gap-1 bg-transparent border-0 cursor-pointer"
                              >
                                <ExternalLink size={12} />
                                <span>Buka Fullscreen</span>
                              </button>
                            </div>
                            <div className="w-full h-[380px] rounded-2xl overflow-hidden border border-[#E8DAC8] bg-[#F7EFE5] shadow-inner">
                              <iframe
                                src={pdfPreviewUrl}
                                className="w-full h-full border-0"
                                title={activeNoteModal.title}
                              />
                            </div>
                          </div>
                        )}

                        {['ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx'].includes(fileExt) && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#8A7977]">📊 Office Document Preview</span>
                              <button
                                onClick={() => handleOpenDocument(downloadUrl, activeNoteModal.title)}
                                className="text-[11px] font-bold text-[#8C5E32] hover:underline flex items-center gap-1 bg-transparent border-0 cursor-pointer"
                              >
                                <ExternalLink size={12} />
                                <span>Buka Dokumen</span>
                              </button>
                            </div>
                            <div className="w-full h-[450px] rounded-2xl overflow-hidden border border-[#E8DAC8] bg-[#FAF4EC] shadow-sm">
                              <iframe
                                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(downloadUrl)}`}
                                className="w-full h-full border-0"
                                title={activeNoteModal.title}
                              />
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Document Control Widget with AI Extract & Download File Buttons (Hidden for txt files and plain notes without document) */}
                    {showDocControlWidget && (
                      <div className="p-4 bg-[#FAF0E6] border border-[#E8DAC8] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#C89B68] text-white flex items-center justify-center font-extrabold text-xs uppercase shadow-sm">
                            {fileExt || 'FILE'}
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-[#4A3E3C] truncate max-w-xs">{activeNoteModal.title}</p>
                            <p className="text-[10px] text-[#8A7977] font-semibold">
                              {downloadUrl ? `Dokumen ${fileExt.toUpperCase()} • Ready` : 'Belum Terhubung File Asli'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {downloadUrl ? (
                            <>
                              <button
                                onClick={() => handleRealAIScan(activeNoteModal)}
                                disabled={scanningId === activeNoteModal.id}
                                className="bg-[#C89B68] hover:bg-[#B88B58] text-white text-xs font-extrabold py-2 px-3.5 rounded-xl shadow-sm flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                              >
                                <Sparkles size={14} className={scanningId === activeNoteModal.id ? 'animate-spin' : ''} />
                                <span>
                                  {scanningId === activeNoteModal.id
                                    ? (scanStatus[activeNoteModal.id] || 'Membaca dokumen...')
                                    : 'AI Baca Teks'}
                                </span>
                              </button>

                              <a
                                href={downloadUrl}
                                download={activeNoteModal.title}
                                className="bg-white hover:bg-[#F7EFE5] border border-[#E8DAC8] text-[#8C5E32] text-xs font-extrabold py-2 px-3.5 rounded-xl shadow-xs flex items-center gap-1.5 active:scale-95"
                              >
                                <Download size={14} className="text-[#C89B68]" />
                                <span>Download File {fileExt ? fileExt.toUpperCase() : 'Asli'}</span>
                              </a>
                            </>
                          ) : (
                            <button
                              onClick={() => handleAttachFileToNote(activeNoteModal)}
                              disabled={scanningId === activeNoteModal.id}
                              className="bg-[#C89B68] hover:bg-[#B88B58] text-white text-xs font-extrabold py-2 px-4 rounded-xl shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                            >
                              <Upload size={14} />
                              <span>
                                {scanningId === activeNoteModal.id
                                  ? (scanStatus[activeNoteModal.id] || 'Mengunggah file...')
                                  : '📤 Hubungkan File PDF / Baca AI'}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Note Text Content */}
              <div className="bg-[#FAF4EC] border border-[#E8DAC8] rounded-2xl p-4 sm:p-5 text-sm text-[#4A3E3C] leading-relaxed font-medium transition-all">
                <div className="flex items-center justify-between mb-3 border-b border-[#E8DAC8]/70 pb-2">
                  <div className="flex items-center gap-2">
                    <FileText size={15} className="text-[#8C5E32]" />
                    <span className="text-xs font-extrabold text-[#4A3E3C] uppercase tracking-wider">
                      {activeNoteModal.ocr_extracted || activeNoteModal.ocrExtracted ? 'Isi Catatan (Hasil Baca AI)' : 'Isi Catatan'}
                    </span>
                  </div>
                  
                  {!isEditingText ? (
                    <button
                      onClick={() => {
                        setEditTextContent(formatCleanNoteContent(activeNoteModal.content));
                        setIsEditingText(true);
                      }}
                      className="text-xs font-bold text-[#8C5E32] hover:text-[#5C3E20] bg-white border border-[#E8DAC8] hover:border-[#C89B68] hover:bg-[#FAF0E6] px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                    >
                      <SquarePen size={13} />
                      <span>Edit Teks</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsEditingText(false)}
                        className="text-xs font-bold text-[#8A7977] hover:bg-[#E8DAC8] px-2.5 py-1.5 rounded-xl transition-all"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleSaveEditedText}
                        className="text-xs font-bold text-white bg-[#C89B68] hover:bg-[#B88B58] px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                      >
                        <CheckCircle2 size={13} />
                        <span>Simpan Perubahan</span>
                      </button>
                    </div>
                  )}
                </div>

                {isEditingText ? (
                  <div className="space-y-2">
                    <textarea
                      value={editTextContent}
                      onChange={(e) => setEditTextContent(e.target.value)}
                      rows={8}
                      placeholder="Ketik atau edit teks catatan di sini..."
                      className="w-full bg-white border-2 border-[#C89B68] rounded-xl p-3 text-sm text-[#4A3E3C] focus:outline-none focus:ring-2 focus:ring-[#C89B68]/30 leading-relaxed font-medium transition-all shadow-inner"
                    />
                    <p className="text-[11px] text-[#8A7977] text-right">
                      {editTextContent.length} karakter • {editTextContent.trim() ? editTextContent.trim().split(/\s+/).length : 0} kata
                    </p>
                  </div>
                ) : (
                  formatCleanNoteContent(activeNoteModal.content) ? (
                    <div className="whitespace-pre-wrap select-text">
                      {formatCleanNoteContent(activeNoteModal.content)}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-[#8A7977] text-xs italic">
                      Belum ada teks catatan. Klik tombol <span className="font-bold text-[#8C5E32] not-italic">"Edit Teks"</span> di atas untuk mulai menulis catatan.
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="pt-3 border-t border-[#F3E5D8] flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  handleDeleteNote(activeNoteModal.id);
                  setActiveNoteModal(null);
                }}
                className="text-xs font-bold text-[#A04040] hover:bg-[#FDF0F0] px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Trash2 size={14} />
                <span>Delete Note</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadTextAsFile(activeNoteModal.title, activeNoteModal.content)}
                  className="bg-[#FAF0E6] hover:bg-[#F3E5D8] text-[#4A3E3C] border border-[#E8DAC8] text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                >
                  <Download size={14} className="text-[#C89B68]" />
                  <span>Download (.txt)</span>
                </button>

                <button
                  onClick={() => setActiveNoteModal(null)}
                  className="bg-[#C89B68] hover:bg-[#B88B58] text-white text-xs font-bold py-2 px-4 rounded-xl shadow-sm transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AUTH MODAL (LOGIN & REGISTER) */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 bg-[#4A3E3C]/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#FAF4EC] border border-[#E8DAC8] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-[#8A7977] hover:text-[#4A3E3C] rounded-full hover:bg-[#E8DAC8]/50 transition-all"
              >
                <X size={18} />
              </button>

              {/* Brand Logo Header (Hostinger Style) */}
              <div className="mb-6">
                <StoodyHostingerLogo size="lg" layout="vertical" showSubtitle={true} />
              </div>

              {/* Tab Selector: Login vs Register */}
              <div className="flex bg-[#E8DAC8]/50 p-1 rounded-2xl mb-6">
                <button
                  onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }}
                  className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all ${
                    authMode === 'login' ? 'bg-white text-[#8C5E32] shadow-sm' : 'text-[#8A7977] hover:text-[#4A3E3C]'
                  }`}
                >
                  Masuk (Login)
                </button>
                <button
                  onClick={() => { setAuthMode('register'); setAuthError(''); setAuthSuccess(''); }}
                  className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all ${
                    authMode === 'register' ? 'bg-white text-[#8C5E32] shadow-sm' : 'text-[#8A7977] hover:text-[#4A3E3C]'
                  }`}
                >
                  Daftar Akun Baru
                </button>
              </div>

              {authError && (
                <div className="mb-4 p-3 bg-[#FDF0F0] border border-[#E8C0C0] text-[#A04040] text-xs font-semibold rounded-xl">
                  {authError}
                </div>
              )}

              {authSuccess && (
                <div className="mb-4 p-3 bg-[#F0FDF4] border border-[#C0E8C8] text-[#2E7D32] text-xs font-semibold rounded-xl">
                  {authSuccess}
                </div>
              )}

              {/* Auth Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === 'register' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#4A3E3C] uppercase tracking-wider">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Alysa / Budi"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="w-full bg-white border border-[#E8DAC8] rounded-xl px-3.5 py-2.5 text-xs text-[#4A3E3C] focus:outline-none focus:ring-2 focus:ring-[#C89B68]/30 font-medium"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#4A3E3C] uppercase tracking-wider">Alamat Email</label>
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-white border border-[#E8DAC8] rounded-xl px-3.5 py-2.5 text-xs text-[#4A3E3C] focus:outline-none focus:ring-2 focus:ring-[#C89B68]/30 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#4A3E3C] uppercase tracking-wider">Kata Sandi (Password)</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full bg-white border border-[#E8DAC8] rounded-xl px-3.5 py-2.5 text-xs text-[#4A3E3C] focus:outline-none focus:ring-2 focus:ring-[#C89B68]/30 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-[#C89B68] hover:bg-[#B88B58] text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {authLoading ? (
                    <Sparkles size={16} className="animate-spin" />
                  ) : (
                    <span>{authMode === 'login' ? 'Masuk ke Stoody' : 'Buat Akun Stoody Baru'}</span>
                  )}
                </button>
              </form>

              {/* Demo Account Switcher */}
              <div className="mt-6 pt-5 border-t border-[#E8DAC8] text-center">
                <p className="text-[11px] text-[#8A7977] font-semibold mb-2.5">
                  ⚡ Pengujian Cepat Multi-User (Coba Akun Demo):
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleDemoAccountSwitch('Alysa', 'alysa@stoody.id')}
                    className="bg-white border border-[#E8DAC8] hover:border-[#C89B68] text-[#8C5E32] text-xs font-bold py-1.5 px-3 rounded-xl transition-all shadow-xs active:scale-95"
                  >
                    🌸 Akun Alysa
                  </button>
                  <button
                    onClick={() => handleDemoAccountSwitch('Budi', 'budi@stoody.id')}
                    className="bg-white border border-[#E8DAC8] hover:border-[#C89B68] text-[#8C5E32] text-xs font-bold py-1.5 px-3 rounded-xl transition-all shadow-xs active:scale-95"
                  >
                    🧢 Akun Budi
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
