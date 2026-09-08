import React, { useState, useEffect, useRef } from 'react';
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
  SquarePen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient';

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

  const [activeNav, setActiveNav] = useState('All Notes');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [scanningId, setScanningId] = useState(null);
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

  const fileInputRef = useRef(null);

  const [isCloudConnected, setIsCloudConnected] = useState(true);

  const fetchData = async () => {
    try {
      setIsSyncing(true);
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

    const courseName = newCourse.trim() || selectedFolder || 'General';

    // Auto add folder if it doesn't exist yet
    if (courseName && !folders.some(f => f.name.toLowerCase() === courseName.toLowerCase())) {
      const newFolderObj = { id: `f-${Date.now()}`, name: courseName };
      await supabase.from('folders').insert([newFolderObj]);
      setFolders(prev => [newFolderObj, ...prev]);
    }

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
      activeNav === 'All Notes' ? true :
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
        // For documents (PPT, PDF, etc.)
        if (filePublicUrl) {
          contentText = `[${fileTypeLabel}] ${file.name}\n\n📥 DOWNLOAD_URL: ${filePublicUrl}`;
        }
      }

      // Only use columns that exist in the Supabase notes table
      const newNote = {
        id: (Date.now() + i).toString(),
        title: file.name,
        course: selectedFolder || 'General',
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

  const handleSimulateAIScan = (noteId) => {
    setScanningId(noteId);
    setTimeout(() => {
      setNotes(notes.map(n => {
        if (n.id === noteId) {
          return {
            ...n,
            ocrExtracted: true,
            content: n.content + '\n\n[AI Scan Result]:\n- Course material summary.'
          };
        }
        return n;
      }));
      setScanningId(null);
    }, 1200);
  };

  const totalClassesCount = Object.values(SCHEDULE_DATA).flat().length;

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-[#FFF9F2] text-[#4A3E3C] overflow-hidden font-sans">
      
      {/* MOBILE TOP HEADER BAR (Mobile screens only) */}
      <div className="flex md:hidden items-center justify-between p-4 bg-[#FAF4EC] border-b border-[#E8DAC8]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#C89B68] flex items-center justify-center text-white shadow-sm">
            <BookOpen size={16} className="fill-white/20" />
          </div>
          <h1 className="text-lg font-extrabold text-[#4A3E3C]">Stoody</h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white border border-[#E8DAC8] px-2.5 py-1 rounded-full text-xs font-extrabold">
            <span>🌸</span>
            <span>Alysa</span>
          </div>
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
                    { label: 'All Notes', icon: FileText, type: 'nav' },
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C89B68] flex items-center justify-center text-white shadow-sm">
              <BookOpen size={20} className="fill-white/20" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-[#4A3E3C] font-display">
                Stoody
              </h1>
            </div>
          </div>

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
              { label: 'All Notes', icon: FileText, type: 'nav' },
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

            {/* User Profile Badge (Alysa - Desktop only) */}
            <div className="hidden md:flex items-center gap-2 bg-white border border-[#E8DAC8] px-3.5 py-1.5 rounded-full shadow-sm">
              <div className="w-7 h-7 rounded-full bg-[#F3E5D8] text-[#8C5E32] flex items-center justify-center text-xs font-bold">
                🌸
              </div>
              <span className="text-xs font-extrabold text-[#4A3E3C]">Alysa</span>
            </div>
          </div>
        </header>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-bold text-[#8A7977]">
          <button 
            onClick={() => { setSelectedFolder(null); setActiveNav('All Notes'); }}
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
                Drop whiteboard photos / course files here to upload
              </p>
              <p className="text-[10px] text-[#8A7977]">
                Upload note photos or course documents
              </p>
            </div>

            {/* Folders Section */}
            {!selectedFolder && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-black tracking-widest text-[#8A7977] uppercase">
                    Course Folders ({folders.length})
                  </h2>

                  <button
                    onClick={() => setIsFolderModalOpen(true)}
                    className="text-[11px] text-[#8C5E32] font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus size={12} />
                    <span>Add Folder</span>
                  </button>
                </div>

                {folders.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {folders.map((f) => (
                      <div
                        key={f.id}
                        onClick={() => setSelectedFolder(f.name)}
                        className="bg-white border border-[#E8DAC8] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:shadow-md hover:border-[#C89B68] hover:-translate-y-0.5 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#F3E5D8] text-[#8C5E32] flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Folder size={20} className="fill-[#C89B68]/30 text-[#C89B68]" />
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-[#4A3E3C] line-clamp-1 group-hover:text-[#8C5E32] transition-colors">
                              {f.name}
                            </h3>
                            <p className="text-[10px] text-[#8A7977]">{notes.filter(n => n.course === f.name).length} Notes</p>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFolder(f.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-[#8A7977] hover:text-[#A04040] transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center bg-white/60 border border-[#E8DAC8] rounded-2xl text-xs text-[#8A7977]">
                    No folders yet. Click <strong>+ Course Folder</strong> to create a new folder.
                  </div>
                )}
              </div>
            )}

            {/* Notes Grid Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black tracking-widest text-[#8A7977] uppercase">
                  {selectedFolder ? `Notes: ${selectedFolder}` : 'All Notes'} ({filteredNotes.length})
                </h2>

                {selectedFolder && (
                  <button
                    onClick={() => setSelectedFolder(null)}
                    className="text-[10px] text-[#8C5E32] font-bold hover:underline"
                  >
                    View All Folders
                  </button>
                )}
              </div>

              {filteredNotes.length > 0 ? (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-3'}>
                  <AnimatePresence>
                    {filteredNotes.map((note) => (
                      <motion.div
                        key={note.id}
                        layout
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        className="bg-white border border-[#E8DAC8] rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-[#C89B68] transition-all flex flex-col justify-between group"
                      >
                        <div>
                          {/* Header Card */}
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#F3E5D8] text-[#8C5E32]">
                              {note.course}
                            </span>

                            <button
                              onClick={() => handleDeleteNote(note.id)}
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
                                      className="flex-1 bg-[#C89B68] hover:bg-[#B88B58] text-white text-[11px] font-bold py-1.5 px-3 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
                                    >
                                      <Download size={13} />
                                      <span>Download</span>
                                    </a>
                                    
                                    <a
                                      href={downloadUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="bg-white hover:bg-[#F7EFE5] border border-[#E8DAC8] text-[#8C5E32] text-[11px] font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1"
                                    >
                                      <ExternalLink size={13} />
                                      <span>Open</span>
                                    </a>
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
                                      <p className="text-[10px] text-[#8A7977]">Re-upload to enable download</p>
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
                                  onClick={() => setPreviewImage(img)}
                                  className="relative h-32 rounded-xl overflow-hidden cursor-pointer border border-[#E8DAC8] group/img"
                                >
                                  <img 
                                    src={img} 
                                    alt="Note Photo" 
                                    loading="eager"
                                    decoding="async"
                                    className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300 bg-[#F7EFE5]" 
                                  />
                                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                                    <ImageIcon size={14} />
                                    <span>View Photo</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Text Preview (hide download URL marker from display) */}
                          <p className="text-xs text-[#8A7977] whitespace-pre-line leading-relaxed line-clamp-3">
                            {(note.content || '').replace(/\n\n📥 DOWNLOAD_URL: .+/, '')}
                          </p>
                        </div>

                        {/* Footer Card */}
                        <div className="mt-4 pt-3 border-t border-[#F3E5D8] flex items-center justify-between">
                          <span className="text-[10px] text-[#8A7977] font-semibold flex items-center gap-1">
                            <Clock size={12} />
                            {note.date} • {note.size}
                          </span>

                          {note.images && note.images.length > 0 && (
                            <button
                              onClick={() => handleSimulateAIScan(note.id)}
                              disabled={scanningId === note.id}
                              className="text-[10px] font-bold text-[#8C5E32] bg-[#F3E5D8] hover:bg-[#E8D4C1] px-2.5 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                            >
                              <Sparkles size={11} className={scanningId === note.id ? 'animate-spin' : ''} />
                              <span>{scanningId === note.id ? 'Scanning...' : 'AI Scan'}</span>
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="py-16 text-center bg-white border border-[#E8DAC8] rounded-2xl p-8 max-w-sm mx-auto shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-[#F3E5D8] text-[#8C5E32] mx-auto flex items-center justify-center text-xl mb-3">
                    📝
                  </div>
                  <h3 className="font-bold text-[#4A3E3C] text-sm mb-1">No Notes Yet</h3>
                  <p className="text-xs text-[#8A7977] mb-4">Click the button below to create your first note.</p>
                  <button
                    onClick={() => setIsNoteModalOpen(true)}
                    className="bg-[#C89B68] hover:bg-[#B88B58] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 mx-auto"
                  >
                    <Plus size={14} />
                    <span>New Note</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* MODAL: Add New Note */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#4A3E3C]/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8DAC8] rounded-3xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F3E5D8] pb-3">
              <h3 className="font-extrabold text-[#4A3E3C] text-base">Create New Note 📝</h3>
              <button onClick={() => setIsNoteModalOpen(false)} className="text-[#8A7977] hover:text-[#4A3E3C]">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddNote} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#8A7977] mb-1">Note Title</label>
                <input
                  type="text"
                  placeholder="Enter note title..."
                  required
                  className="w-full bg-[#FAF4EC] border border-[#E8DAC8] rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-[#C89B68]"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8A7977] mb-1">Course / Folder</label>
                <input
                  type="text"
                  placeholder="Course name (e.g. Algorithms)"
                  className="w-full bg-[#FAF4EC] border border-[#E8DAC8] rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-[#C89B68]"
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8A7977] mb-1">Note Content</label>
                <textarea
                  rows={4}
                  placeholder="Write your note content here..."
                  className="w-full bg-[#FAF4EC] border border-[#E8DAC8] rounded-xl p-3 text-xs font-medium focus:outline-none"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#8A7977]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#C89B68] text-white text-xs font-bold shadow-sm"
                >
                  Save Note
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

    </div>
  );
}
