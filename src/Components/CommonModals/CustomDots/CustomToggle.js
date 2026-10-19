import React from "react";

const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
  <a
    href=''
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
    style={{ textDecoration: "none" }}
  >
    {children}
    <span className='threedots' />
  </a>
));

export default CustomToggle;


// const CustomToggle = React.forwardRef(({ children, onClick, ...props }, ref) => (
//   <button
//     type="button"
//     ref={ref}
//     onClick={onClick}
//     aria-label="More actions"
//     {...props}
//     style={{ background: "none", border: "none", padding: 0, ...(props.style || {}) }}
//   >
//     {children}
//     <span className="threedots" aria-hidden="true" />
//   </button>
// ));

// CustomToggle.displayName = "CustomToggle";

// export default CustomToggle;