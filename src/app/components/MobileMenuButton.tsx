import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
type MobileMenuButtonProps = {
  onClick: () => void;
};

function MobileMenuButton({ onClick }: MobileMenuButtonProps) {
  return (
    <button className="absolute right-2 top-0 p-2" onClick={onClick}>
      <FontAwesomeIcon className="text-4xl" icon={faBars} />
    </button>
  );
}
export default MobileMenuButton;
