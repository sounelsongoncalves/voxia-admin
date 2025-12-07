import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FileItem } from '../types';

const getFolders = (t: any): FileItem[] => [
    { id: 'received', name: t('files.defaultFolders.received'), type: 'folder', size: '3 itens', date: new Date().toLocaleDateString() },
    { id: 'f1', name: t('files.defaultFolders.projectFiles'), type: 'folder', size: '21.8 MB', date: 'Feb 19, 2025' },
    { id: 'f2', name: t('files.defaultFolders.documents'), type: 'folder', size: '10.5 MB', date: 'Feb 18, 2025' },
    { id: 'f3', name: t('files.defaultFolders.teamResources'), type: 'folder', size: '783.1 kB', date: 'Feb 15, 2025' },
    { id: 'f4', name: t('files.defaultFolders.clientData'), type: 'folder', size: '5.4 MB', date: 'Feb 10, 2025' },
    { id: 'f5', name: t('files.defaultFolders.backupFiles'), type: 'folder', size: '2.5 MB', date: 'Feb 01, 2025' },
];

const FILES: FileItem[] = [
    {
        id: '1', name: 'Tech design.pdf', type: 'pdf', size: '2.2 MB', date: 'Feb 19, 2025',
        url: 'https://pdfobject.com/pdf/sample.pdf',
        sharedWith: [{ name: 'Jessica Wells', avatar: 'https://i.pravatar.cc/150?u=jessica' }],
        folderId: 'f1'
    },
    {
        id: '2', name: 'Financial_Report.xlsx', type: 'xlsx', size: '1.5 MB', date: 'Feb 18, 2025',
        url: 'https://go.microsoft.com/fwlink/?LinkID=521962', // Sample Excel
        folderId: 'f2'
    },
    {
        id: '3', name: 'Modern_Laputa.jpg', type: 'jpg', size: '139.2 kB', date: 'Feb 17, 2025',
        url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000'
    },
    {
        id: '4', name: 'Project_Presentation.pptx', type: 'pptx', size: '3.1 MB', date: 'Feb 16, 2025',
        url: 'https://scholar.harvard.edu/files/torman_personal/files/samplepptx.pptx',
        folderId: 'f1'
    },
    {
        id: '5', name: 'Network_Diagram.jpg', type: 'jpg', size: '123.5 kB', date: 'Feb 15, 2025',
        url: 'https://images.unsplash.com/photo-1558494949-ef526b0042a0?auto=format&fit=crop&q=80&w=1000'
    },
    {
        id: '6', name: 'Project_Summary.docx', type: 'docx', size: '987.7 kB', date: 'Feb 14, 2025',
        url: 'https://calibre-ebook.com/downloads/demos/demo.docx',
        folderId: 'f2'
    },
    {
        id: '7', name: 'Gradient_store.jpg', type: 'jpg', size: '157.9 kB', date: 'Feb 13, 2025',
        url: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=1000'
    },
    {
        id: '8', name: 'Colorful_donunt.jpg', type: 'jpg', size: '216.8 kB', date: 'Feb 12, 2025',
        url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=1000'
    },
    // Mock Driver Files
    {
        id: 'd1', name: 'Entrega_NF_1234.jpg', type: 'jpg', size: '2.4 MB', date: new Date().toLocaleDateString(),
        url: 'https://images.unsplash.com/photo-1625246333195-58197bd47d26?auto=format&fit=crop&q=80&w=1000', // Delivery/Box image
        folderId: 'received'
    },
    {
        id: 'd2', name: 'Comprovante_Abastecimento.jpg', type: 'jpg', size: '1.8 MB', date: new Date().toLocaleDateString(),
        url: 'https://images.unsplash.com/photo-1565514020176-dbf227747033?auto=format&fit=crop&q=80&w=1000', // Receipt image
        folderId: 'received'
    },
    {
        id: 'd3', name: 'Avaria_Parachoque.jpg', type: 'jpg', size: '3.1 MB', date: new Date().toLocaleDateString(),
        url: 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&q=80&w=1000', // Truck/Damage image
        folderId: 'received'
    },
];

export const FileManager: React.FC = () => {
    const { t } = useTranslation();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [currentFolder, setCurrentFolder] = useState<FileItem | null>(null);
    const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [folders, setFolders] = useState<FileItem[]>(getFolders(t));
    const [files, setFiles] = useState<FileItem[]>(FILES);

    // Update folders when language changes
    React.useEffect(() => {
        setFolders(getFolders(t));
    }, [t]);

    // Folder Management State
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [folderModalMode, setFolderModalMode] = useState<'create' | 'rename'>('create');
    const [folderNameInput, setFolderNameInput] = useState('');
    const [activeFolderMenuId, setActiveFolderMenuId] = useState<string | null>(null);
    const [folderToEdit, setFolderToEdit] = useState<FileItem | null>(null);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'folder': return 'folder';
            case 'pdf': return 'picture_as_pdf';
            case 'jpg':
            case 'png':
            case 'jpeg':
            case 'gif': return 'image';
            case 'docx': return 'description';
            case 'pptx': return 'slideshow';
            case 'xlsx': return 'table_view';
            default: return 'insert_drive_file';
        }
    };

    const getFileColor = (type: string) => {
        switch (type) {
            case 'folder': return 'text-yellow-400';
            case 'pdf': return 'text-red-500';
            case 'jpg':
            case 'png':
            case 'jpeg':
            case 'gif': return 'text-purple-500';
            case 'docx': return 'text-blue-500';
            case 'pptx': return 'text-orange-500';
            case 'xlsx': return 'text-green-500';
            default: return 'text-gray-400';
        }
    };

    const handleFolderClick = (folder: FileItem) => {
        setCurrentFolder(folder);
        setSearchQuery(''); // Clear search when navigating
    };

    const handleBackClick = () => {
        setCurrentFolder(null);
        setSearchQuery('');
    };

    const handleFileClick = (file: FileItem) => {
        setSelectedFile(file);
        setShowPreview(true);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Simulate file upload
            const newFile: FileItem = {
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                type: file.name.split('.').pop() as any || 'unknown',
                size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                url: URL.createObjectURL(file), // Create local preview URL
                folderId: currentFolder?.id // Assign to current folder if inside one
            };
            setFiles(prev => [newFile, ...prev]);
        }
    };

    // Folder Management Handlers
    const handleCreateFolderClick = () => {
        setFolderModalMode('create');
        setFolderNameInput('');
        setShowFolderModal(true);
    };

    const handleRenameFolderClick = (e: React.MouseEvent, folder: FileItem) => {
        e.stopPropagation();
        setFolderModalMode('rename');
        setFolderNameInput(folder.name);
        setFolderToEdit(folder);
        setShowFolderModal(true);
        setActiveFolderMenuId(null);
    };

    const handleDeleteFolderClick = (e: React.MouseEvent, folderId: string) => {
        e.stopPropagation();
        if (window.confirm(t('files.modal.deleteConfirm'))) {
            setFolders(prev => prev.filter(f => f.id !== folderId));
        }
        setActiveFolderMenuId(null);
    };

    const handleSaveFolder = () => {
        if (!folderNameInput.trim()) return;

        if (folderModalMode === 'create') {
            const newFolder: FileItem = {
                id: Math.random().toString(36).substr(2, 9),
                name: folderNameInput,
                type: 'folder',
                size: '0 B',
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            };
            setFolders(prev => [newFolder, ...prev]);
        } else if (folderModalMode === 'rename' && folderToEdit) {
            setFolders(prev => prev.map(f => f.id === folderToEdit.id ? { ...f, name: folderNameInput } : f));
        }

        setShowFolderModal(false);
    };

    const toggleFolderMenu = (e: React.MouseEvent, folderId: string) => {
        e.stopPropagation();
        setActiveFolderMenuId(prev => prev === folderId ? null : folderId);
    };

    // Drag and Drop Handlers
    const handleDragStart = (e: React.DragEvent, fileId: string) => {
        e.dataTransfer.setData('fileId', fileId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Allow drop
    };

    const handleDrop = (e: React.DragEvent, targetFolderId: string) => {
        e.preventDefault();
        const fileId = e.dataTransfer.getData('fileId');

        if (fileId) {
            setFiles(prevFiles => prevFiles.map(file => {
                if (file.id === fileId) {
                    return { ...file, folderId: targetFolderId };
                }
                return file;
            }));
        }
    };

    // Filter content based on search query and current folder
    const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

    // Filter files: 
    // 1. If searching, show all matching files regardless of folder
    // 2. If inside a folder, show files with matching folderId
    // 3. If at root (and not searching), show files with NO folderId
    const filteredFiles = files.filter(f => {
        const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
        if (searchQuery) return matchesSearch;

        if (currentFolder) {
            return f.folderId === currentFolder.id;
        } else {
            return !f.folderId;
        }
    });

    const renderPreviewContent = () => {
        if (!selectedFile || !selectedFile.url) return null;

        if (['jpg', 'png', 'jpeg', 'gif'].includes(selectedFile.type)) {
            return <img src={selectedFile.url} alt={selectedFile.name} className="max-w-full max-h-[80vh] object-contain rounded-lg" />;
        }

        if (selectedFile.type === 'pdf') {
            return <iframe src={selectedFile.url} className="w-full h-[80vh] rounded-lg" title="PDF Preview"></iframe>;
        }

        if (['docx', 'pptx', 'xlsx'].includes(selectedFile.type)) {
            // Use Microsoft Office Online Viewer for public URLs
            // Note: This won't work for local blob URLs created via upload, only for public URLs
            if (selectedFile.url.startsWith('blob:')) {
                return (
                    <div className="flex flex-col items-center justify-center h-64 text-txt-tertiary">
                        <span className="material-symbols-outlined text-6xl mb-4">visibility_off</span>
                        <p>{t('files.preview.noOnlinePreview')}</p>
                    </div>
                );
            }
            const encodedUrl = encodeURIComponent(selectedFile.url);
            return (
                <iframe
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`}
                    className="w-full h-[80vh] rounded-lg"
                    title="Office Document Preview"
                ></iframe>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center h-64 text-txt-tertiary">
                <span className="material-symbols-outlined text-6xl mb-4">visibility_off</span>
                <p>{t('files.preview.noPreview')}</p>
                <a href={selectedFile.url} target="_blank" rel="noopener noreferrer" className="mt-4 px-4 py-2 bg-brand-primary text-bg-main rounded-lg font-bold">
                    {t('files.details.download')}
                </a>
            </div>
        );
    };

    return (
        <div className="flex h-[calc(100vh-2rem)] gap-6" onClick={() => setActiveFolderMenuId(null)}>
            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-bg-main">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        {currentFolder && (
                            <button onClick={handleBackClick} className="p-2 hover:bg-surface-2 rounded-full transition-colors">
                                <span className="material-symbols-outlined text-txt-primary">arrow_back</span>
                            </button>
                        )}
                        <h1 className="text-2xl font-bold text-txt-primary">
                            {currentFolder ? currentFolder.name : t('files.title')}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-txt-tertiary text-sm">search</span>
                            <input
                                type="text"
                                placeholder={t('files.searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-surface-1 border border-surface-border rounded-lg py-2 pl-9 pr-4 text-sm text-txt-primary outline-none focus:border-brand-primary w-64"
                            />
                        </div>

                        <button
                            onClick={handleCreateFolderClick}
                            className="px-4 py-2 bg-surface-1 border border-surface-border hover:bg-surface-2 text-txt-primary font-bold rounded-lg text-sm transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">create_new_folder</span>
                            {t('files.newFolder')}
                        </button>

                        <div className="bg-surface-1 border border-surface-border rounded-lg p-1 flex">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-surface-3 text-txt-primary' : 'text-txt-tertiary hover:text-txt-primary'}`}
                            >
                                <span className="material-symbols-outlined text-xl">grid_view</span>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-surface-3 text-txt-primary' : 'text-txt-tertiary hover:text-txt-primary'}`}
                            >
                                <span className="material-symbols-outlined text-xl">list</span>
                            </button>
                        </div>

                        <button
                            onClick={handleUploadClick}
                            className="px-4 py-2 bg-brand-primary hover:bg-brand-hover text-bg-main font-bold rounded-lg text-sm transition-colors flex items-center gap-2 shadow-lg shadow-brand-primary/20"
                        >
                            <span className="material-symbols-outlined">upload_file</span>
                            {t('files.upload')}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-sm text-txt-tertiary mb-4">
                        <span className={`cursor-pointer hover:text-txt-primary ${!currentFolder ? 'font-bold text-txt-primary' : ''}`} onClick={handleBackClick}>{t('files.home')}</span>
                        {currentFolder && (
                            <>
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                                <span className="font-bold text-txt-primary">{currentFolder.name}</span>
                            </>
                        )}
                    </div>

                    {!currentFolder ? (
                        <>
                            {/* Folders Section */}
                            {filteredFolders.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-lg font-bold text-txt-primary mb-4">{t('files.folders')}</h2>
                                    {viewMode === 'grid' ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                            {filteredFolders.map(folder => (
                                                <div
                                                    key={folder.id}
                                                    onClick={() => handleFolderClick(folder)}
                                                    onDragOver={handleDragOver}
                                                    onDrop={(e) => handleDrop(e, folder.id)}
                                                    className="bg-surface-1 border border-surface-border rounded-xl p-4 hover:bg-surface-2 transition-colors cursor-pointer group relative"
                                                >
                                                    <div className="flex justify-between items-start mb-3">
                                                        <span className="material-symbols-outlined text-4xl text-yellow-400">folder</span>
                                                        <button
                                                            onClick={(e) => toggleFolderMenu(e, folder.id)}
                                                            className={`text-txt-tertiary hover:text-txt-primary transition-opacity ${activeFolderMenuId === folder.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                                        >
                                                            <span className="material-symbols-outlined">more_horiz</span>
                                                        </button>

                                                        {/* Context Menu */}
                                                        {activeFolderMenuId === folder.id && (
                                                            <div className="absolute top-10 right-2 w-32 bg-surface-2 border border-surface-border rounded-lg shadow-xl z-10 overflow-hidden">
                                                                <button
                                                                    onClick={(e) => handleRenameFolderClick(e, folder)}
                                                                    className="w-full text-left px-4 py-2 text-sm text-txt-primary hover:bg-surface-3 flex items-center gap-2"
                                                                >
                                                                    <span className="material-symbols-outlined text-sm">edit</span>
                                                                    {t('files.actions.rename')}
                                                                </button>
                                                                <button
                                                                    onClick={(e) => handleDeleteFolderClick(e, folder.id)}
                                                                    className="w-full text-left px-4 py-2 text-sm text-semantic-error hover:bg-surface-3 flex items-center gap-2"
                                                                >
                                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                                    {t('files.actions.delete')}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <h3 className="font-bold text-txt-primary truncate">{folder.name}</h3>
                                                    <p className="text-xs text-txt-tertiary mt-1">{folder.size} • {folder.date}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            {filteredFolders.map(folder => (
                                                <div
                                                    key={folder.id}
                                                    onClick={() => handleFolderClick(folder)}
                                                    onDragOver={handleDragOver}
                                                    onDrop={(e) => handleDrop(e, folder.id)}
                                                    className="bg-surface-1 border border-surface-border rounded-lg p-3 hover:bg-surface-2 transition-colors cursor-pointer flex items-center gap-4"
                                                >
                                                    <span className="material-symbols-outlined text-2xl text-yellow-400">folder</span>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-txt-primary truncate">{folder.name}</h3>
                                                    </div>
                                                    <span className="text-sm text-txt-tertiary w-24">{folder.size}</span>
                                                    <span className="text-sm text-txt-tertiary w-32">{folder.date}</span>

                                                    <button
                                                        onClick={(e) => toggleFolderMenu(e, folder.id)}
                                                        className={`text-txt-tertiary hover:text-txt-primary transition-opacity ${activeFolderMenuId === folder.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                                    >
                                                        <span className="material-symbols-outlined">more_horiz</span>
                                                    </button>

                                                    {/* Context Menu */}
                                                    {activeFolderMenuId === folder.id && (
                                                        <div className="absolute top-10 right-2 w-32 bg-surface-2 border border-surface-border rounded-lg shadow-xl z-10 overflow-hidden">
                                                            <button
                                                                onClick={(e) => handleRenameFolderClick(e, folder)}
                                                                className="w-full text-left px-4 py-2 text-sm text-txt-primary hover:bg-surface-3 flex items-center gap-2"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">edit</span>
                                                                {t('files.actions.rename')}
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleDeleteFolderClick(e, folder.id)}
                                                                className="w-full text-left px-4 py-2 text-sm text-semantic-error hover:bg-surface-3 flex items-center gap-2"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">delete</span>
                                                                {t('files.actions.delete')}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Files Section (Root) */}
                            <div>
                                <h2 className="text-lg font-bold text-txt-primary mb-4">{t('files.recentFiles')}</h2>
                                {filteredFiles.length === 0 && searchQuery === '' ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-txt-tertiary">
                                        <span className="material-symbols-outlined text-6xl mb-4 opacity-20">folder_open</span>
                                        <p>{t('files.emptyRoot')}</p>
                                    </div>
                                ) : filteredFiles.length === 0 && searchQuery !== '' ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-txt-tertiary">
                                        <span className="material-symbols-outlined text-6xl mb-4 opacity-20">search_off</span>
                                        <p>{t('files.noSearchResults')}</p>
                                    </div>
                                ) : viewMode === 'grid' ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                        {filteredFiles.map(file => (
                                            <div
                                                key={file.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, file.id)}
                                                onClick={() => handleFileClick(file)}
                                                className="bg-surface-1 border border-surface-border rounded-xl p-4 hover:bg-surface-2 transition-colors cursor-pointer group relative flex flex-col active:opacity-50"
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getFileColor(file.type).replace('text-', 'bg-').replace('500', '500/10')}`}>
                                                        <span className={`material-symbols-outlined text-2xl ${getFileColor(file.type)}`}>{getFileIcon(file.type)}</span>
                                                    </div>
                                                    <button className="text-txt-tertiary hover:text-txt-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="material-symbols-outlined">more_horiz</span>
                                                    </button>
                                                </div>
                                                <h3 className="font-bold text-txt-primary truncate mb-1" title={file.name}>{file.name}</h3>
                                                <p className="text-xs text-txt-tertiary">{file.size}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {filteredFiles.map(file => (
                                            <div
                                                key={file.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, file.id)}
                                                onClick={() => handleFileClick(file)}
                                                className="bg-surface-1 border border-surface-border rounded-lg p-3 hover:bg-surface-2 transition-colors cursor-pointer flex items-center gap-4 active:opacity-50"
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getFileColor(file.type).replace('text-', 'bg-').replace('500', '500/10')}`}>
                                                    <span className={`material-symbols-outlined text-lg ${getFileColor(file.type)}`}>{getFileIcon(file.type)}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-txt-primary truncate">{file.name}</h3>
                                                </div>
                                                <span className="text-sm text-txt-tertiary w-24">{file.size}</span>
                                                <span className="text-sm text-txt-tertiary w-32">{file.date}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        /* Inside Folder View */
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-txt-primary">{t('files.filesIn')} {currentFolder.name}</h2>
                                <span className="text-sm text-txt-tertiary">{filteredFiles.length} {t('files.items')}</span>
                            </div>

                            {filteredFiles.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-txt-tertiary">
                                    <span className="material-symbols-outlined text-6xl mb-4 opacity-20">folder_open</span>
                                    <p>{t('files.emptyFolder')}</p>
                                </div>
                            ) : (
                                viewMode === 'grid' ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                        {filteredFiles.map(file => (
                                            <div
                                                key={file.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, file.id)}
                                                onClick={() => handleFileClick(file)}
                                                className="bg-surface-1 border border-surface-border rounded-xl p-4 hover:bg-surface-2 transition-colors cursor-pointer group relative flex flex-col active:opacity-50"
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getFileColor(file.type).replace('text-', 'bg-').replace('500', '500/10')}`}>
                                                        <span className={`material-symbols-outlined text-2xl ${getFileColor(file.type)}`}>{getFileIcon(file.type)}</span>
                                                    </div>
                                                    <button className="text-txt-tertiary hover:text-txt-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="material-symbols-outlined">more_horiz</span>
                                                    </button>
                                                </div>
                                                <h3 className="font-bold text-txt-primary truncate mb-1" title={file.name}>{file.name}</h3>
                                                <p className="text-xs text-txt-tertiary">{file.size}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {filteredFiles.map(file => (
                                            <div
                                                key={file.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, file.id)}
                                                onClick={() => handleFileClick(file)}
                                                className="bg-surface-1 border border-surface-border rounded-lg p-3 hover:bg-surface-2 transition-colors cursor-pointer flex items-center gap-4 active:opacity-50"
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getFileColor(file.type).replace('text-', 'bg-').replace('500', '500/10')}`}>
                                                    <span className={`material-symbols-outlined text-lg ${getFileColor(file.type)}`}>{getFileIcon(file.type)}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-txt-primary truncate">{file.name}</h3>
                                                </div>
                                                <span className="text-sm text-txt-tertiary w-24">{file.size}</span>
                                                <span className="text-sm text-txt-tertiary w-32">{file.date}</span>
                                            </div>
                                        ))}
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Sidebar (Details) - Only visible on large screens */}
            {selectedFile && (
                <div className="w-80 bg-surface-1 border border-surface-border rounded-2xl p-6 hidden xl:flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-txt-primary">{t('files.details.title')}</h3>
                        <button onClick={() => setSelectedFile(null)} className="text-txt-tertiary hover:text-txt-primary">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div className="flex flex-col items-center mb-8">
                        <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mb-4 ${getFileColor(selectedFile.type).replace('text-', 'bg-').replace('500', '500/10')}`}>
                            <span className={`material-symbols-outlined text-6xl ${getFileColor(selectedFile.type)}`}>{getFileIcon(selectedFile.type)}</span>
                        </div>
                        <h2 className="text-lg font-bold text-txt-primary text-center break-all">{selectedFile.name}</h2>
                        <p className="text-sm text-txt-tertiary mt-1">{selectedFile.size}</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-txt-tertiary mb-1">{t('files.details.type')}</p>
                            <p className="text-sm font-medium text-txt-primary uppercase">{selectedFile.type}</p>
                        </div>
                        <div>
                            <p className="text-xs text-txt-tertiary mb-1">{t('files.details.created')}</p>
                            <p className="text-sm font-medium text-txt-primary">{selectedFile.date}</p>
                        </div>
                        <div>
                            <p className="text-xs text-txt-tertiary mb-1">{t('files.details.modified')}</p>
                            <p className="text-sm font-medium text-txt-primary">{selectedFile.date}</p>
                        </div>

                        {selectedFile.sharedWith && (
                            <div>
                                <p className="text-xs text-txt-tertiary mb-2">{t('files.details.sharedWith')}</p>
                                <div className="flex items-center gap-2">
                                    {selectedFile.sharedWith.map((user, idx) => (
                                        <img key={idx} src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border-2 border-surface-1" title={user.name} />
                                    ))}
                                    <button className="w-8 h-8 rounded-full bg-surface-2 border border-dashed border-txt-tertiary flex items-center justify-center text-txt-tertiary hover:text-txt-primary hover:border-txt-primary transition-colors">
                                        <span className="material-symbols-outlined text-sm">add</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-auto pt-6 border-t border-surface-border flex gap-2">
                        <button
                            onClick={() => setShowPreview(true)}
                            className="flex-1 py-2 bg-brand-primary text-bg-main font-bold rounded-lg hover:bg-brand-hover transition-colors"
                        >
                            {t('files.details.open')}
                        </button>
                        <button className="p-2 border border-surface-border rounded-lg hover:bg-surface-2 text-txt-primary transition-colors">
                            <span className="material-symbols-outlined">download</span>
                        </button>
                        <button className="p-2 border border-surface-border rounded-lg hover:bg-surface-2 text-semantic-error transition-colors">
                            <span className="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {showPreview && selectedFile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-surface-1 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-surface-border">
                        <div className="flex justify-between items-center p-4 border-b border-surface-border bg-surface-2">
                            <div className="flex items-center gap-3">
                                <span className={`material-symbols-outlined ${getFileColor(selectedFile.type)}`}>{getFileIcon(selectedFile.type)}</span>
                                <h3 className="font-bold text-txt-primary">{selectedFile.name}</h3>
                            </div>
                            <div className="flex gap-2">
                                <a href={selectedFile.url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-surface-3 rounded-lg text-txt-primary transition-colors" title="Abrir em nova aba">
                                    <span className="material-symbols-outlined">open_in_new</span>
                                </a>
                                <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-surface-3 rounded-lg text-txt-primary transition-colors">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 bg-bg-sec p-4 flex items-center justify-center overflow-auto">
                            {renderPreviewContent()}
                        </div>
                    </div>
                </div>
            )}

            {/* Folder Modal (Create/Rename) */}
            {showFolderModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={(e) => e.stopPropagation()}>
                    <div className="bg-surface-1 rounded-2xl w-full max-w-md p-6 border border-surface-border shadow-2xl">
                        <h3 className="text-xl font-bold text-txt-primary mb-4">
                            {folderModalMode === 'create' ? t('files.modal.createTitle') : t('files.modal.renameTitle')}
                        </h3>
                        <input
                            type="text"
                            value={folderNameInput}
                            onChange={(e) => setFolderNameInput(e.target.value)}
                            placeholder={t('files.modal.inputPlaceholder')}
                            className="w-full bg-bg-main border border-surface-border rounded-lg px-4 py-2 text-txt-primary outline-none focus:border-brand-primary mb-6"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveFolder();
                                if (e.key === 'Escape') setShowFolderModal(false);
                            }}
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowFolderModal(false)}
                                className="px-4 py-2 text-txt-primary hover:bg-surface-2 rounded-lg transition-colors"
                            >
                                {t('files.modal.cancel')}
                            </button>
                            <button
                                onClick={handleSaveFolder}
                                className="px-4 py-2 bg-brand-primary text-bg-main font-bold rounded-lg hover:bg-brand-hover transition-colors"
                            >
                                {t('files.modal.save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
