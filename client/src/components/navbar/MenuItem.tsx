'use client';

interface MenuItemProps {
  onClick: () => void;
  label: string;
}

const MenuItem: React.FC<MenuItemProps> = ({
  onClick,
  label
}) => {
  return ( 
    <div 
      onClick={onClick} 
      className="
        px-4 
        py-2.5 
        text-foreground
        hover:bg-muted 
        transition-colors
        font-medium
        text-sm
      "
    >
      {label}
    </div>
   );
}

export default MenuItem;
