'use client';

interface HeadingProps {
  title: string;
  subtitle?: string;
  center?: boolean;
}

const Heading: React.FC<HeadingProps> = ({ 
  title, 
  subtitle,
  center
}) => {
  return ( 
    <div className={center ? 'text-center' : 'text-start'}>
      <div className="text-2xl font-bold text-foreground">
        {title}
      </div>
      <div className="font-normal text-muted-foreground mt-1.5 text-sm">
        {subtitle}
      </div>
    </div>
   );
}
 
export default Heading;
