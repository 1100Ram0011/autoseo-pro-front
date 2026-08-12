import { useState } from "react";
import { Edit, Trash2, LayoutTemplate, Mail, AlertTriangle } from "lucide-react";
import { useSelector } from "react-redux";
import AuthPage from "@/pages/user/AuthPage";
import DemoAnimatedAuthModal from "@/ReUseAbleComponents/DemoAnimatedAuthModal";
import { motion, AnimatePresence } from "framer-motion";
import { TemplateCard } from "./AIGeneratedEmailTemplates";

const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString();
};

export default function TemplateTable({
    templates = [],
    onEdit,
    onDelete,
    onPreview,
    isDeleting = false,
}) {
    const [templateToDelete, setTemplateToDelete] = useState(null);
    const reduxUser = useSelector((state) => state.auth?.user);
    const [showAuthModal, setShowAuthModal] = useState(false);

    if (!templates.length) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-8 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
                    <LayoutTemplate className="h-7 w-7 text-[var(--app-pages-text)]" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-[var(--app-pages-text)]">
                    No Templates Found
                </h3>
                <p className="max-w-md text-sm text-[var(--app-pages-subhead-text)]">
                    Create your first custom email template or generate one using AI to get started.
                </p>
            </div>
        );
    }

    const handleConfirmDelete = async () => {
        if (!templateToDelete) return;
        await onDelete(templateToDelete);
        setTemplateToDelete(null);
    };

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {templates.map((t) => (
                    <TemplateCard 
                        key={t._id} 
                        template={t} 
                        mode="my" 
                        onEdit={onEdit} 
                        onDelete={setTemplateToDelete} 
                        onPreview={onPreview || onEdit} 
                        formatDate={formatRelativeTime} 
                    />
                ))}
            </div>

            {/* DELETE CONFIRM MODAL */}
            <AnimatePresence>
                {templateToDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[120] flex items-center justify-center bg-[var(--app-pages-bg)]/80 backdrop-blur-sm p-4"
                        onClick={() => setTemplateToDelete(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md overflow-hidden rounded-2xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-6 shadow-2xl "
                        >
                           <div className="p-1">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--app-pages-bg)]">
                                    <AlertTriangle className="h-6 w-6 text-[var(--app-debit-color)]" />
                                    </div>
                                    <h3 className="text-xl font-bold text-[var(--app-pages-text)]">
                                    Delete Template
                                    </h3>
                                </div>
                                <p className="text-sm text-[var(--app-pages-subhead-text)]">
                                    Are you sure you want to permanently delete{" "}
                                    <span className="font-semibold text-[var(--app-pages-text)]">
                                    "{templateToDelete.name}"
                                    </span>
                                    ? This action cannot be undone.
                                </p>
                            </div>
                            <div className="flex items-center justify-end gap-3 px-6 py-4">
                                <button
                                    onClick={() => setTemplateToDelete(null)}
                                    disabled={isDeleting}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--app-pages-text)] border hover:border-[var(--app-pages-muted)] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (reduxUser?.isGuest) {
                                            setTemplateToDelete(null)
                                            setShowAuthModal(true)
                                            return
                                        }
                                        handleConfirmDelete()
                                    }}
                                    disabled={isDeleting}
                                    className="flex items-center justify-center gap-2 rounded-lg text-[var(--app-debit-color)] px-4 py-2 text-sm font-medium bg-[var(--app-pages-bg)] border-[var(--app-debit-color)] border shadow-sm transition-all hover:bg-[var(--app-debit-color)] hover:text-[var(--app-pages-bg)]"
                                >
                                    {isDeleting ? "Deleting..." : "Delete Template"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* AUTH MODAL */}
            {showAuthModal && (
                <DemoAnimatedAuthModal
                    isOpen={showAuthModal}
                    onClose={() => setShowAuthModal(false)}
                >
                    <AuthPage onSuccess={() => setShowAuthModal(false)} />
                </DemoAnimatedAuthModal>
            )}
        </>
    );
}
