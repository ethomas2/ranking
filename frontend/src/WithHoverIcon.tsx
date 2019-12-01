import React, {useState} from 'react';

type WithHoverIconProps = {
  children: JSX.Element;
  onClick?: () => void;
};
const WithHoverIcon: React.FC<WithHoverIconProps> = props => {
  const {children, onClick} = props;
  const child = React.Children.only(children);
  const [childRef, setChildRef] = useState<Element | null>(null);

  const [mouseOverChild, setMouseOverChild] = useState<boolean>(false);
  const [mouseOverIcon, setMouseOverIcon] = useState<boolean>(false);
  const iconVisible = mouseOverChild || mouseOverIcon;

  const icon = childRef && (
    <img
      src="/minus-icon.png"
      alt="no img"
      style={{
        position: 'absolute',
        // I think accessing window attributes in render is a no no
        top: window.scrollY + childRef.getBoundingClientRect().top - 6,
        left: window.scrollX + childRef.getBoundingClientRect().left - 6,
        width: '12px',
        height: '12px',
        display: iconVisible ? 'block' : 'none',
      }}
      onMouseOver={() => setMouseOverIcon(true)}
      onMouseLeave={() => setMouseOverIcon(false)}
      onClick={onClick}
    />
  );

  const elm = React.cloneElement(child, {
    onMouseOver: () => setMouseOverChild(true),
    onMouseLeave: () => setMouseOverChild(false),
    ref: (r: Element | null) => setChildRef(r),
  });

  return (
    <>
      {elm}
      {icon}
    </>
  );
};

export default WithHoverIcon;
