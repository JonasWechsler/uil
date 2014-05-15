console.log("is this running");
var editor = ace.edit("qq");
console.log(themeq + " what" );
editor.setTheme("ace/theme/" + themeq);
editor.getSession().setMode("ace/mode/java");
editor.getSession().setUseWorker(false);
editor.setReadOnly(true);
editor.setFontSize("15px");
editor.renderer.setShowGutter(false);
editor.setOptions({
    maxLines: Infinity
});
//eclipse,twilight
var code = ace.edit("cc");
code.setTheme("ace/theme/" + themec);
code.getSession().setMode("ace/mode/java");
code.setReadOnly(true);
code.getSession().setUseWorker(false);
code.setFontSize("15px");
code.renderer.setShowGutter(false);
editor.container.style.pointerEvents="none";
code.container.style.pointerEvents="none";
code.setHighlightActiveLine(false);
editor.setHighlightActiveLine(false);
code.setOptions({
    maxLines: Infinity
});
