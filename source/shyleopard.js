// WIP api.
(function(ShyLeopard)
{
	"use strict";

	let version = "2020.01.1";

	ShyLeopard.getVersion = function()
	{
		return version;
	};

	ShyLeopard.Bubbler = (function()
	{
		let _targetContainer;
		let _layerCount;
		let _smallCellSize;
		let _transitionTimer;
		let _svgSize;

		let _isInteractable;

		let _image;
		let _lastLayerPopsLeft;

		let _layerCanvases;
		let _svgElement;

		let _completeCallBackFunction;
		let _popCallBackFunction;

		function Bubbler(targetContainer, layerCount, smallCellSize, transitionTimer)
		{
			_targetContainer = targetContainer;
			_layerCount = layerCount;
			_smallCellSize = smallCellSize;
			_transitionTimer = transitionTimer;
			_svgSize = smallCellSize * Math.pow(2, layerCount - 1);

			_isInteractable = true;

			_image = null;
			_lastLayerPopsLeft = Math.pow(4, _layerCount - 2);

			_layerCanvases = null;
			_svgElement = this._createSVGElement();

			_completeCallBackFunction = null;
			_popCallBackFunction = null;
		};

		Bubbler.prototype.getTargetContainer = function()
		{
			return _targetContainer;
		};

		Bubbler.prototype.getLayerCount = function()
		{
			return _layerCount;
		};

		Bubbler.prototype.getSmallCellSize = function()
		{
			return _smallCellSize;
		};

		Bubbler.prototype.isInteractable = function()
		{
			return _isInteractable;
		};

		Bubbler.prototype.continueInteraction = function()
		{
			_isInteractable = true;
		};

		Bubbler.prototype.pauseInteraction = function()
		{
			_isInteractable = false;
		};

		Bubbler.prototype.getImage = function()
		{
			return _image;
		};

		Bubbler.prototype.getSVGElement = function()
		{
			return _svgElement;
		};

		Bubbler.prototype.onComplete = function(completeCallBackFunction)
		{
			_completeCallBackFunction = completeCallBackFunction;
		};

		Bubbler.prototype.onPop = function(popCallBackFunction)
		{
			_popCallBackFunction = popCallBackFunction;
		};

		Bubbler.prototype.generate = function(image)
		{
			this.clear();
			_image = image;
			_layerCanvases = this._generateLayerCanvases();
			_targetContainer.appendChild(_svgElement);

			this._generateCircle(0, 0, 0);
		};

		Bubbler.prototype.clear = function()
		{
			_svgElement.remove();
			_svgElement = this._createSVGElement();
			_lastLayerPopsLeft = Math.pow(4, _layerCount - 2);
		};

		Bubbler.prototype._generateCircle = function(layer, row, column)
		{
			let newCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			let color = this._getLayerColorHex(layer, row, column);
			let radius = _smallCellSize * Math.pow(2, _layerCount - 1 - layer) / 2;
			let x = row * radius * 2 + radius;
			let y = column * radius * 2 + radius;

			if (_transitionTimer == 0)
			{
				newCircle.setAttributeNS(null, "r", radius.toString());
				newCircle.setAttributeNS(null, "style", "fill: " + color + ";");
			}
			else
			{
				newCircle.setAttributeNS(null, "r", "0");
				newCircle.setAttributeNS(null, "style", "fill: " + color + "; transition: all " + _transitionTimer + "s;");
			}

			newCircle.setAttributeNS(null, "cx", x.toString());
			newCircle.setAttributeNS(null, "cy", y.toString());

			newCircle.setAttributeNS("https://github.com/Krazune/ShyLeopard.js", "shyleopard:layer", layer.toString());
			newCircle.setAttributeNS("https://github.com/Krazune/ShyLeopard.js", "shyleopard:row", row.toString());
			newCircle.setAttributeNS("https://github.com/Krazune/ShyLeopard.js", "shyleopard:column", column.toString());

			_svgElement.appendChild(newCircle);

			// Make sure the transition runs.
			if (_transitionTimer > 0)
			{
				requestAnimationFrame(function()
				{
					requestAnimationFrame(function()
					{
						newCircle.setAttributeNS(null, "r", radius.toString());
					});
				});
			}
		};

		Bubbler.prototype._getLayerColorHex = function(layer, row, column)
		{
			let canvasContext = _layerCanvases[layer].getContext("2d");

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
			let canvasesArray = new Array(_layerCount);

			for (let i = 0; i < _layerCount; ++i)
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

			newCanvas.getContext("2d").drawImage(_image, 0, 0, size, size);

			return newCanvas;
		};

		Bubbler.prototype._createSVGElement = function()
		{
			let svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");

			svgElement.setAttribute("xmlns:shyleopard","https://github.com/Krazune/ShyLeopard.js");
			svgElement.setAttributeNS(null, "viewBox", "0 0 " + _svgSize + " " + _svgSize);

			let shyLeopardThis = this;

			svgElement.addEventListener("mouseover", function(event)
				{
					shyLeopardThis._processMouseOver(event);
				});

			return svgElement;
		};

		Bubbler.prototype._processMouseOver = function(event)
		{
			if (!_isInteractable)
			{
				return;
			}

			if (event.target.tagName != "circle")
			{
				return;
			}

			this._processCircleMouseOver(event.target);
		};

		Bubbler.prototype._processCircleMouseOver = function(circleElement)
		{
			let parentLayer = parseInt(circleElement.getAttributeNS("https://github.com/Krazune/ShyLeopard.js", "layer"));

			if (parentLayer == _layerCount - 1)
			{
				return;
			}

			let parentRow = parseInt(circleElement.getAttributeNS("https://github.com/Krazune/ShyLeopard.js", "row"));
			let parentColumn = parseInt(circleElement.getAttributeNS("https://github.com/Krazune/ShyLeopard.js", "column"));

			circleElement.remove();

			if (_popCallBackFunction != null)
			{
				_popCallBackFunction({ layer : parentLayer, row : parentRow, column : parentColumn });
			}

			this._generateCircleChildren(parentLayer, parentRow, parentColumn);

			if (parentLayer == _layerCount - 2)
			{
				--_lastLayerPopsLeft;
			}

			if (_lastLayerPopsLeft == 0)
			{
				if (_completeCallBackFunction != null)
				{
					_completeCallBackFunction();
				}
			}
		};

		Bubbler.prototype._generateCircleChildren = function(parentLayer, parentRow, parentColumn)
		{
			let layer = parentLayer + 1;
			let childRow = parentRow * 2;
			let childColumn = parentColumn * 2;

			this._generateCircle(layer, childRow, childColumn);
			this._generateCircle(layer, childRow, childColumn + 1);
			this._generateCircle(layer, childRow + 1, childColumn + 1);
			this._generateCircle(layer, childRow + 1, childColumn);
		};

		return Bubbler;
	})();
})(window.ShyLeopard = window.ShyLeopard || {});