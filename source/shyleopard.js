/*
	MIT License

	Copyright (c) 2020 Miguel Sousa

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/
(function(ShyLeopard)
{
	"use strict";

	let _version = "2021.12.1";

	ShyLeopard.getVersion = function()
	{
		return _version;
	};

	ShyLeopard.Bubbler = (function()
	{
		const shyLeopardXMLNS = "shyleopard";
		const shyLeopardURI = "https://github.com/Krazune/ShyLeopard.js";


		function Bubbler(targetContainer, layerCount, smallCellSize, transitionTimer)
		{
			this._targetContainer = targetContainer;
			this._layerCount = layerCount;
			this._smallCellSize = smallCellSize;
			this._transitionTimer = transitionTimer;
			this._svgSize = smallCellSize * Math.pow(2, layerCount - 1);

			this._isInteractable = true;

			this._image = null;
			this._lastLayerPopsLeft = Math.pow(4, this._layerCount - 2);

			this._layerCanvases = null;
			this._svgElement = this._createSVGElement();

			this._completeCallback = null;
			this._popCallback = null;
		};

		Bubbler.prototype.getTargetContainer = function()
		{
			return this._targetContainer;
		};

		Bubbler.prototype.getLayerCount = function()
		{
			return this._layerCount;
		};

		Bubbler.prototype.getSmallCellSize = function()
		{
			return this._smallCellSize;
		};

		Bubbler.prototype.getTransitionTimer = function()
		{
			return this._transitionTimer;
		};

		Bubbler.prototype.isInteractable = function()
		{
			return this._isInteractable;
		};

		Bubbler.prototype.continueInteraction = function()
		{
			this._isInteractable = true;
		};

		Bubbler.prototype.pauseInteraction = function()
		{
			this._isInteractable = false;
		};

		Bubbler.prototype.getImage = function()
		{
			return this._image;
		};

		Bubbler.prototype.getSVGElement = function()
		{
			return this._svgElement;
		};

		Bubbler.prototype.onComplete = function(completeCallback)
		{
			this._completeCallback = completeCallback;
		};

		Bubbler.prototype.onPop = function(popCallback)
		{
			this._popCallback = popCallback;
		};

		Bubbler.prototype.generate = function(image)
		{
			if (this._image != null)
			{
				this.clear();
			}

			this._image = image;
			this._layerCanvases = this._generateLayerCanvases();
			this._targetContainer.appendChild(this._svgElement);

			let bubblerThis = this;

			// The transition is not triggered if the initial circle is added at the same time as the svg element.
			requestAnimationFrame(function()
				{
					// Initial circle.
					bubblerThis._generateCircle(0, 0, 0);
				});
		};

		Bubbler.prototype.clear = function()
		{
			this._svgElement.remove();
			this._svgElement = this._createSVGElement();

			this._lastLayerPopsLeft = Math.pow(4, this._layerCount - 2);
		};

		Bubbler.prototype._createSVGElement = function()
		{
			let svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");

			svgElement.setAttribute("xmlns:" + shyLeopardXMLNS, shyLeopardURI);
			svgElement.setAttributeNS(null, "viewBox", "0 0 " + this._svgSize + " " + this._svgSize);

			let bubblerThis = this;

			svgElement.addEventListener("mouseover", function(event)
				{
					bubblerThis._processMouseOver(event);
				});

			return svgElement;
		};

		Bubbler.prototype._processMouseOver = function(event)
		{
			if (!this._isInteractable)
			{
				return;
			}

			if (event.target.tagName != "circle")
			{
				return;
			}

			this._processCircleMouseOver(event.target);
		};

		Bubbler.prototype._processCircleMouseOver = function(parentCircle)
		{
			let parentLayer = parseInt(parentCircle.getAttributeNS(shyLeopardURI, "layer"));

			// Already at last layer - not poppable.
			if (parentLayer == this._layerCount - 1)
			{
				return;
			}

			let parentRow = parseInt(parentCircle.getAttributeNS(shyLeopardURI, "row"));
			let parentColumn = parseInt(parentCircle.getAttributeNS(shyLeopardURI, "column"));

			parentCircle.remove();

			this._generateCircleChildren(parentLayer, parentRow, parentColumn);

			if (this._popCallback != null)
			{
				this._popCallback(
					{
						layer: parentLayer,
						row: parentRow,
						column: parentColumn
					});
			}

			if (parentLayer == this._layerCount - 2)
			{
				--this._lastLayerPopsLeft;

				if (this._lastLayerPopsLeft == 0 && this._completeCallback != null)
				{
					this._completeCallback();
				}
			}
		};

		Bubbler.prototype._generateCircleChildren = function(parentLayer, parentRow, parentColumn)
		{
			let layer = parentLayer + 1;
			let baseChildRow = parentRow * 2;
			let baseChildColumn = parentColumn * 2;

			this._generateCircle(layer, baseChildRow, baseChildColumn);
			this._generateCircle(layer, baseChildRow, baseChildColumn + 1);
			this._generateCircle(layer, baseChildRow + 1, baseChildColumn + 1);
			this._generateCircle(layer, baseChildRow + 1, baseChildColumn);
		};

		Bubbler.prototype._generateCircle = function(layer, row, column)
		{
			let newCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			let color = this._getLayerColorHex(layer, row, column);
			let radius = this._smallCellSize * Math.pow(2, this._layerCount - 1 - layer) / 2;
			let x = row * radius * 2 + radius;
			let y = column * radius * 2 + radius;

			newCircle.setAttributeNS(null, "style", "fill: " + color + "; transition: all " + this._transitionTimer + "s;");
			newCircle.setAttributeNS(null, "cx", x.toString());
			newCircle.setAttributeNS(null, "cy", y.toString());

			newCircle.setAttributeNS(shyLeopardURI, shyLeopardXMLNS + ":layer", layer.toString());
			newCircle.setAttributeNS(shyLeopardURI, shyLeopardXMLNS + ":row", row.toString());
			newCircle.setAttributeNS(shyLeopardURI, shyLeopardXMLNS + ":column", column.toString());

			this._svgElement.appendChild(newCircle);

			if (this._transitionTimer > 0)
			{
				newCircle.setAttributeNS(null, "r", "0");

				// Make sure the transition runs, by setting the radius on the next frame.
				requestAnimationFrame(function()
					{
						newCircle.setAttributeNS(null, "r", radius.toString());
					});
			}
			else
			{
				newCircle.setAttributeNS(null, "r", radius.toString());
			}
		};

		Bubbler.prototype._getLayerColorHex = function(layer, row, column)
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

		Bubbler.prototype._generateLayerCanvases = function()
		{
			let canvasesArray = new Array(this._layerCount);

			for (let i = 0; i < this._layerCount; ++i)
			{
				canvasesArray[i] = this._generateLayerCanvas(i);
			}

			return canvasesArray;
		};

		Bubbler.prototype._generateLayerCanvas = function(layer)
		{
			let newCanvas = document.createElement("canvas");
			let size = Math.pow(2, layer);

			newCanvas.width = size;
			newCanvas.height = size;

			newCanvas.getContext("2d").drawImage(this._image, 0, 0, size, size);

			return newCanvas;
		};

		return Bubbler;
	})();
})(window.ShyLeopard = window.ShyLeopard || {});