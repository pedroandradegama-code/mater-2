declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        src?: string;
        alt?: string;
        'auto-rotate'?: boolean | string;
        'auto-rotate-delay'?: string;
        'rotation-per-second'?: string;
        'camera-controls'?: boolean | string;
        'interaction-prompt'?: string;
        'shadow-intensity'?: string;
        exposure?: string;
        scale?: string;
        'camera-orbit'?: string;
        'environment-image'?: string;
      },
      HTMLElement
    >;
  }
}
