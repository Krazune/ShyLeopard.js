(function(ShyLeopard)
{
	"use strict";

	let version = "2020.11.1";

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

		const shyLeopardXMLNS = "shyleopard";
		const shyLeopardURI = "https://github.com/Krazune/ShyLeopard.js";
		let _svgElement;

		let _completeCallback;
		let _popCallback;

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

			_completeCallback = null;
			_popCallback = null;
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

		Bubbler.prototype.getTransitionTimer = function()
		{
			return _transitionTimer;
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

		Bubbler.prototype.onComplete = function(completeCallback)
		{
			_completeCallback = completeCallback;
		};

		Bubbler.prototype.onPop = function(popCallback)
		{
			_popCallback = popCallback;
		};

		Bubbler.prototype.generate = function(image)
		{
			if (_image != null)
			{
				this.clear();
			}

			_image = image;
			_layerCanvases = this._generateLayerCanvases();
			_targetContainer.appendChild(_svgElement);

			// Initial circle.
			this._generateCircle(0, 0, 0);
		};

		Bubbler.prototype.clear = function()
		{
			_svgElement.remove();
			_svgElement = this._createSVGElement();

			_lastLayerPopsLeft = Math.pow(4, _layerCount - 2);
		};

		Bubbler.prototype._createSVGElement = function()
		{
			let svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");

			svgElement.setAttribute("xmlns:" + shyLeopardXMLNS, shyLeopardURI);
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

		Bubbler.prototype._processCircleMouseOver = function(parentCircle)
		{
			let parentLayer = parseInt(parentCircle.getAttributeNS(shyLeopardURI, "layer"));

			// Already at last layer - not poppable.
			if (parentLayer == _layerCount - 1)
			{
				return;
			}

			let parentRow = parseInt(parentCircle.getAttributeNS(shyLeopardURI, "row"));
			let parentColumn = parseInt(parentCircle.getAttributeNS(shyLeopardURI, "column"));

			parentCircle.remove();

			this._generateCircleChildren(parentLayer, parentRow, parentColumn);

			if (_popCallback != null)
			{
				_popCallback(
					{
						layer: parentLayer,
						row: parentRow,
						column: parentColumn
					});
			}

			if (parentLayer == _layerCount - 2)
			{
				--_lastLayerPopsLeft;

				if (_lastLayerPopsLeft == 0 && _completeCallback != null)
				{
					_completeCallback();
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
			let radius = _smallCellSize * Math.pow(2, _layerCount - 1 - layer) / 2;
			let x = row * radius * 2 + radius;
			let y = column * radius * 2 + radius;

			newCircle.setAttributeNS(null, "style", "fill: " + color + "; transition: all " + _transitionTimer + "s;");
			newCircle.setAttributeNS(null, "cx", x.toString());
			newCircle.setAttributeNS(null, "cy", y.toString());

			newCircle.setAttributeNS(shyLeopardURI, shyLeopardXMLNS + ":layer", layer.toString());
			newCircle.setAttributeNS(shyLeopardURI, shyLeopardXMLNS + ":row", row.toString());
			newCircle.setAttributeNS(shyLeopardURI, shyLeopardXMLNS + ":column", column.toString());

			_svgElement.appendChild(newCircle);

			// Make sure the transition runs, by forcing reflow (hacky/expensive solution).
			if (_transitionTimer > 0)
			{
				newCircle.setAttributeNS(null, "r", "0");

				requestAnimationFrame(function()
					{
						requestAnimationFrame(function()
							{
								newCircle.setAttributeNS(null, "r", radius.toString());
							});
					});
			}
			else
			{
				newCircle.setAttributeNS(null, "r", radius.toString());
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

		return Bubbler;
	})();
})(window.ShyLeopard = window.ShyLeopard || {});