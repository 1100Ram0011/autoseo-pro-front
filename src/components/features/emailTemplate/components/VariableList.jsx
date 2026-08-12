/**
 * Displays detected template variables
 */
export default function VariableList({ variables = [] }) {
    const hasVariables = variables.length > 0;

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Template Variables
                </label>

                {hasVariables && (
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                        {variables.length} detected
                    </span>
                )}
            </div>

            {/* Empty State */}
            {!hasVariables ? (
                <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-4 text-sm text-gray-500 text-center">
                    No dynamic variables detected in this template.
                </div>
            ) : (
                <>
                    {/* Variables */}
                    <div className="flex flex-wrap gap-2">
                        {variables.map((variable) => (
                            <span
                                key={variable}
                                className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-medium transition hover:bg-blue-100"
                            >
                                {`{{${variable}}}`}
                            </span>
                        ))}
                    </div>

                    {/* Footer Note */}
                    <p className="text-xs text-gray-400 mt-4 leading-relaxed">
                        Ensure your Excel file contains matching column headers for each
                        variable above.
                    </p>
                </>
            )}
        </div>
    );
}
