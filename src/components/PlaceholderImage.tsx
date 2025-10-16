export function PlaceholderImage({ width = 150, height = 150, className = "" }) {
    return (
        <div
            className={`flex items-center justify-center bg-gray-200 text-gray-500 ${className}`}
            style={{ width, height }}
        >
            <svg
                width={width * 0.4}
                height={height * 0.4}
                viewBox="0 0 24 24"
                fill="currentColor"
            >
                <path d="m16.034 14.475c-1-4-6-6-9-3-3 3 1.0625 10.861 9 12.96 7.9375-2.2381 11-9.9597 9-12.96-2-3-8-1-9 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <ellipse cx="16.034" cy="5.9407" rx="7.033" ry="1.4657" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
        </div>
    );
}
