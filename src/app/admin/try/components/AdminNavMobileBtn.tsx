import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo } from "react";

// Preload the icon by adding it to the library
import { library } from '@fortawesome/fontawesome-svg-core';
library.add(faArrowRight);

type AdminNavMobileBtnProps = {
    onClick: () => void;
};

function AdminNavMobileBtn({ onClick }: AdminNavMobileBtnProps) {
    return (
        <button
            className="absolute left-1 -top-2 p-2 will-change-transform touch-manipulation"
            onClick={onClick}
            aria-label="Toggle navigation menu"
        >
            <FontAwesomeIcon
                className="text-4xl text-indigo-500 rounded border-2 p-1 border-indigo-600 shadow-lg transition-transform duration-150 hover:scale-105 active:scale-95"
                icon={faArrowRight}
                fixedWidth
            />
        </button>
    );
}

// Memoize to prevent unnecessary re-renders
export default memo(AdminNavMobileBtn);
