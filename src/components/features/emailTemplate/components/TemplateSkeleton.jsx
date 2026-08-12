export default function TemplateSkeleton() {
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 animate-pulse">

            <div className="h-6 w-40 bg-gray-200 rounded mb-6"></div>

            <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div
                        key={index}
                        className="h-10 bg-gray-200 rounded"
                    />
                ))}
            </div>

        </div>
    );
}
