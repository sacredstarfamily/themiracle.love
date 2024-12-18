import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
type MobileDashNavBtnProps = {
    onClick: () => void;
};

function MobileDashNavBtn({ onClick }: MobileDashNavBtnProps) {
    return (
        <button className="absolute left-1 -top-2 p-2" onClick={onClick}>
            <FontAwesomeIcon className="text-3xl text-indigo-500 rounded-full border-2 p-1 border-indigo-600 shadow-lg" icon={faArrowRight} />
        </button>
    );
}
export default MobileDashNavBtn;
