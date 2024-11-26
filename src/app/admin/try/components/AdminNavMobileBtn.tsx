import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
type AdminNavMobileBtnProps = {
    onClick: () => void;
};

function AdminNavMobileBtn({ onClick }: AdminNavMobileBtnProps) {
    return (
        <button className="absolute left-1 -top-2 p-2" onClick={onClick}>
            <FontAwesomeIcon className="text-4xl text-indigo-500 rounded border-2 p-1 border-indigo-600 shadow-lg" icon={faArrowRight} />
        </button>
    );
}
export default AdminNavMobileBtn;
