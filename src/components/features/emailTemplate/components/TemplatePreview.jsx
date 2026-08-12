import { useMemo, useState } from "react";

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function TemplatePreview({ html = "", variables = [] }) {
    const [viewMode, setViewMode] = useState("desktop");

    const previewHtml = useMemo(() => {
        if (!html) return "";

        let rendered = html;

        variables.forEach((variable) => {
            const escaped = escapeRegExp(variable);

            const dummyValue = `
        <span style="
          background:#E0F2FE;
          color:#0369A1;
          padding:2px 6px;
          border-radius:4px;
          font-size:12px;
          font-weight:500;
        ">
          ${variable}
        </span>
      `;

            const regex = new RegExp(`{{\\s*${escaped}\\s*}}`, "g");
            rendered = rendered.replace(regex, dummyValue);
        });

        return rendered;
    }, [html, variables]);

    const isDesktop = viewMode === "desktop";

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">

            {/* HEADER */}
            <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Live Email Preview
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                        Rendering with sample dynamic variables
                    </p>
                </div>

                {/* DEVICE TOGGLE */}
                <div className="flex bg-white border rounded-lg p-1 shadow-sm">
                    {["desktop"].map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`px-4 py-1.5 text-xs font-medium rounded-md transition
                ${viewMode === mode
                                    ? "bg-[#1E4E79] text-white shadow-sm"
                                    : "text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            {mode === "desktop" ? "Desktop" : "Mobile"}
                        </button>
                    ))}
                </div>
            </div>

            {/* BODY */}
            <div className="bg-[#F4F6F8] p-8 flex-1 overflow-auto flex items-start justify-center">

                {!html ? (
                    <div className="text-gray-400 text-sm text-center mt-20">
                        No HTML content available.
                        <div className="mt-1 text-xs text-gray-400">
                            Start writing your template to see a live preview.
                        </div>
                    </div>
                ) : (
                    <div
                        className={`bg-white border shadow-xl rounded-lg transition-all duration-300 ${isDesktop ? "w-[700px]" : "w-[375px]"
                            }`}
                    >
                        <iframe
                            title="Email Preview"
                            className="w-full h-[350px] rounded-lg"
                            sandbox="allow-same-origin"
                            srcDoc={previewHtml}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
