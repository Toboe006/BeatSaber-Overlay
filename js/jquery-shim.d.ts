// Stand-in types so the project compiles without installing @types/jquery
declare const $: any;
declare const jQuery: any;
type JQuery<T = any> = any;
declare namespace NodeJS { type Timeout = number; }
