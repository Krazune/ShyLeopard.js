// WIP api.
function ShyLeopard(targetContainer, image, layerCount, smallCellSize)
{
	this._targetContainer = targetContainer;
	this._image = image;
	this._layerCount = layerCount;
	this._smallCellSize = smallCellSize;
	this._svgSize = smallCellSize * Math.pow(2, layerCount - 1);

	this._layerCanvases = this._generateLayerCanvases();
	this._svgElement = this._createSVGElement();
}

ShyLeopard.prototype.getTargetContainer = function()
{
	return this._targetContainer;
};

ShyLeopard.prototype.getImage = function()
{
	return this._image;
};

ShyLeopard.prototype.getLayerCount = function()
{
	return this._layerCount;
};

ShyLeopard.prototype.getSmallCellSize = function()
{
	return this._smallCellSize;
};

ShyLeopard.prototype.getSVGElement = function()
{
	return this._svgElement;
};

ShyLeopard.prototype.generate = function()
{
	this.clear();
	this._targetContainer.appendChild(this._svgElement);

	this._generateCircle(0, 0, 0);
};

ShyLeopard.prototype.clear = function()
{
	this._svgElement.remove();
	this._svgElement = this._createSVGElement();
};

ShyLeopard.prototype._generateCircle = function(layer, row, column)
{
	let newCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
	let color = this._getLayerColorHex(layer, row, column);
	let radius = this._smallCellSize * Math.pow(2, this._layerCount - 1 - layer) / 2;
	let x = row * radius * 2 + radius;
	let y = column * radius * 2 + radius;

	newCircle.setAttributeNS(null, "style", "fill: " + color + ";");
	newCircle.setAttributeNS(null, "r", radius);
	newCircle.setAttributeNS(null, "cx", x);
	newCircle.setAttributeNS(null, "cy", y);

	newCircle.setAttributeNS("https://github.com/Krazune/ShyLeopard.js", "shyleopard:layer", layer.toString());
	newCircle.setAttributeNS("https://github.com/Krazune/ShyLeopard.js", "shyleopard:row", row.toString());
	newCircle.setAttributeNS("https://github.com/Krazune/ShyLeopard.js", "shyleopard:column", column.toString());

	this._svgElement.appendChild(newCircle);
};

ShyLeopard.prototype._getLayerColorHex = function(layer, row, column)
{
	let canvasContext = this._layerCanvases[layer].getContext("2d");

	let red = canvasContext.getImageData(row, column, 1, 1).data[0].toString(16);
	let green = canvasContext.getImageData(row, column, 1, 1).data[1].toString(16);
	let blue = canvasContext.getImageData(row, column, 1, 1).data[2].toString(16);

	if (red.length == 1)
	{
		red = "0" + red;
	}

	if (blue.length == 1)
	{
		blue = "0" + blue;
	}

	if (green.length == 1)
	{
		green = "0" + green;
	}

	return "#" + red + green + blue;
};

ShyLeopard.prototype._generateLayerCanvases = function()
{
	let canvasesArray = new Array(this._layerCount);

	for (let i = 0; i < this._layerCount; ++i)
	{
		canvasesArray[i] = this._generateLayerCanvas(i);
	}

	return canvasesArray;
};

ShyLeopard.prototype._generateLayerCanvas = function(layer)
{
	let newCanvas = document.createElement("canvas");
	let size = Math.pow(2, layer);

	newCanvas.width = size;
	newCanvas.height = size;

	newCanvas.getContext("2d").drawImage(this._image, 0, 0, size, size);

	return newCanvas;
};

ShyLeopard.prototype._createSVGElement = function()
{
	let svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");

	svgElement.setAttribute("xmlns:shyleopard","https://github.com/Krazune/ShyLeopard.js");
	svgElement.setAttributeNS(null, "viewBox", "0 0 " + this._svgSize + " " + this._svgSize);

	let shyLeopardThis = this;

	svgElement.addEventListener("mouseover", function(event)
		{
			shyLeopardThis._processMouseOver(event);
		});

	return svgElement;
};

ShyLeopard.prototype._processMouseOver = function(event)
{
	if (event.target.tagName != "circle")
	{
		return;
	}

	this._processCircleMouseOver(event.target);
};

ShyLeopard.prototype._processCircleMouseOver = function(circleElement)
{
	let parentLayer = parseInt(circleElement.getAttributeNS("https://github.com/Krazune/ShyLeopard.js", "layer"));

	if (parentLayer == this._layerCount - 1)
	{
		return;
	}

	let parentRow = parseInt(circleElement.getAttributeNS("https://github.com/Krazune/ShyLeopard.js", "row"));
	let parentColumn = parseInt(circleElement.getAttributeNS("https://github.com/Krazune/ShyLeopard.js", "column"));

	circleElement.remove();

	this._generateCircleChildren(parentLayer, parentRow, parentColumn);
};

ShyLeopard.prototype._generateCircleChildren = function(parentLayer, parentRow, parentColumn)
{
	let layer = parentLayer + 1;
	let childRow = parentRow * 2;
	let childColumn = parentColumn * 2;

	this._generateCircle(layer, childRow, childColumn);
	this._generateCircle(layer, childRow, childColumn + 1);
	this._generateCircle(layer, childRow + 1, childColumn + 1);
	this._generateCircle(layer, childRow + 1, childColumn);
};