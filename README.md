# ShyLeopard.js
A JavaScript bubbly image generator (heavily inspired by Vadim Ogievetsky's [koalastothemax.com](https://koalastothemax.com/)).

---

## Version
Current version: **2020.11.1**

*The version format is &quot;&lt;year&gt;.&lt;zero padded month&gt;.&lt;revision number&gt;&quot;.*

---

## License
[MIT License](LICENSE.md)

---

## Usage
After the script is included in the document, it can be used as follows:
```JavaScript
let targetContainer = document.getElementById("target"); // Target container for the SVG element.
let layerCount = 4; // How many layers of bubbles.
let smallCellSize = 4; // Size of the smallest bubble.
let transitionTimer = 0; // Amount of seconds for the transition (0 = transitions disabled).

let bubbler = new ShyLeopard.Bubbler(targetContainer, layerCount, smallCellSize, transitionTimer);

console.log("ShyLeopard Version: " + ShyLeopard.getVersion()); // Version string (for example: "2020.11.1").

// Only one function can be added to the complete event (it can be removed by passing null to the function).
bubbler.onComplete(function()
	{
		console.log("COMPLETED!");
	});

// Only one function can be added to the pop event (it can be removed by passing null to the function).
bubbler.onPop(function(event)
	{
		console.log(event.layer); // Layer of the popped bubble.
		console.log(event.row); // Row of the popped bubble.
		console.log(event.column); // Column of the popped bubble.
	});

bubbler.generate(image); // The parameter is an instance of HTMLImageElement (and must be created before this call).
```

---

## Notes
This generates an SVG element inside the target container, and all circles are created inside this element.

Canvases are used to read, and resize, the source image into the different layers.

When the transitions are enabled, the script forces a reflow every time a bubble is popped, whic is not very efficient - this might be subject to change.

This was created for educational purposes only.