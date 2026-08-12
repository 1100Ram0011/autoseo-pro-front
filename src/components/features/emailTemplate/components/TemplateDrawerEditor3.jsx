import {
    useCreateEmailTemplateMutation,
    useUpdateEmailTemplateMutation
} from "../../../../redux/apis/emailTemplateApi";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactQuill from "react-quill";
import axios from "axios";
import "react-quill/dist/quill.snow.css";

export default function TemplateDrawer({ template, onClose }) {

    const isEdit = Boolean(template?._id);

    const [name, setName] = useState(template?.name || "");
    const [subject, setSubject] = useState(template?.subject || "");
    const [html, setHtml] = useState(template?.html || "");
    const [attachments, setAttachments] = useState([]);
    const [error, setError] = useState("");

    const editorRef = useRef(null);

    const [createTemplate, { isLoading: isCreating }] =
        useCreateEmailTemplateMutation();

    const [updateTemplate, { isLoading: isUpdating }] =
        useUpdateEmailTemplateMutation();

    const isSaving = isCreating || isUpdating;

    /* ========================= */
    /* Extract Variables */
    /* ========================= */

    const variables = useMemo(() => {
        const regex = /{{(.*?)}}/g;
        const matches = [...html.matchAll(regex)];
        return [...new Set(matches.map((m) => m[1].trim()))];
    }, [html]);

    /* ========================= */
    /* Prevent Body Scroll */
    /* ========================= */

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    /* ========================= */
    /* IMAGE UPLOAD HANDLER */
    /* ========================= */

    const handleImageUpload = async () => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append("file", file);

            try {
                const { data } = await axios.post(
                    "/api/upload/image",   // backend endpoint
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );

                const imageUrl = data.url;

                const editor = editorRef.current.getEditor();
                const range = editor.getSelection();
                editor.insertEmbed(range.index, "image", imageUrl);

            } catch (err) {
                setError("Image upload failed.");
            }
        };
    };

    /* ========================= */
    /* Quill Config */
    /* ========================= */

    const modules = {
        toolbar: {
            container: [
                [{ header: [1, 2, false] }],
                ["bold", "italic", "underline"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["link", "image"],
                ["clean"]
            ],
            handlers: {
                image: handleImageUpload
            }
        }
    };

    const formats = [
        "header",
        "bold", "italic", "underline",
        "list", "bullet",
        "link", "image"
    ];

    /* ========================= */
    /* ATTACHMENTS */
    /* ========================= */

    const handleAttachmentUpload = (e) => {
        const files = Array.from(e.target.files);
        setAttachments(prev => [...prev, ...files]);
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    /* ========================= */
    /* SUBMIT */
    /* ========================= */

    const handleSubmit = async () => {
        if (!name || !subject || !html) {
            setError("All fields are required.");
            return;
        }

        try {
            setError("");

            const formData = new FormData();
            formData.append("name", name);
            formData.append("subject", subject);
            formData.append("html", html);

            attachments.forEach((file) => {
                formData.append("attachments", file);
            });

            if (isEdit) {
                formData.append("id", template._id);
                await updateTemplate(formData).unwrap();
            } else {
                await createTemplate(formData).unwrap();
            }

            onClose();

        } catch (err) {
            setError("Failed to save template.");
        }
    };

    /* ========================= */
    /* UI */
    /* ========================= */

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-end z-50">

            <div className="w-full m-8 rounded-2xl bg-white shadow-2xl flex flex-col">

                {/* HEADER */}
                <div className="px-8 py-6 border-b flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            {isEdit ? "Edit Template" : "Create Template"}
                        </h2>
                        <p className="text-sm text-gray-500">
                            Design corporate email layouts with dynamic placeholders.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto px-8 py-6 bg-gray-50">

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-8">

                        {/* LEFT PANEL */}
                        <div className="space-y-6">

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Template Name <span className="text-red-500"> *</span>
                                    </label>
                                    <input
                                        className={`w-full p-1.5 pl-2 border rounded-lg border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200`}
                                        value={name}
                                        placeholder="Template Name"
                                        maxLength={50}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>



                                <div>
                                    <label className="text-sm font-medium text-gray-600">
                                        Subject
                                    </label>
                                    <input
                                        className="w-full border p-3 rounded mt-2 focus:ring-2 focus:ring-gray-800"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-600">
                                    Email Content
                                </label>

                                <ReactQuill
                                    ref={editorRef}
                                    value={html}
                                    onChange={setHtml}
                                    modules={modules}
                                    formats={formats}
                                    className="mt-2 bg-white"
                                />
                            </div>

                            {/* ATTACHMENTS */}
                            <div>
                                <label className="text-sm font-medium text-gray-600">
                                    Attachments
                                </label>

                                <input
                                    type="file"
                                    multiple
                                    onChange={handleAttachmentUpload}
                                    className="mt-2"
                                />

                                {attachments.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {attachments.map((file, index) => (
                                            <div
                                                key={index}
                                                className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded"
                                            >
                                                <span className="text-xs">{file.name}</span>
                                                <button
                                                    onClick={() => removeAttachment(index)}
                                                    className="text-red-500 text-xs"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* RIGHT PREVIEW */}
                        <div className="bg-white border rounded-lg p-6 shadow-sm overflow-auto">
                            <div
                                dangerouslySetInnerHTML={{ __html: html }}
                            />
                        </div>

                    </div>

                </div>

                {/* FOOTER */}
                <div className="px-8 py-4 border-t flex justify-end gap-4 bg-white">

                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="border px-5 py-2 rounded-lg"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-black disabled:opacity-50"
                    >
                        {isSaving ? "Saving..." : "Save Template"}
                    </button>

                </div>

            </div>
        </div>
    );
}
