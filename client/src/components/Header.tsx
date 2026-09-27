import React from "react";

const Header = ({ title, subtitle }: HeaderProps) => {
  return (
    <div className="mb-5">
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
};

export default Header;
