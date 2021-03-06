"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = exports.propTypes = void 0;

var _extends3 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var React = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _classnames = _interopRequireDefault(require("classnames"));

var _constants = require("./constants");

var _utils = require("./utils");

var _TableContext = _interopRequireDefault(require("./TableContext"));

var _Column = _interopRequireDefault(require("./Column"));

var propTypes = {
  align: _propTypes["default"].oneOf(['left', 'center', 'right']),
  verticalAlign: _propTypes["default"].oneOf(['top', 'middle', 'bottom']),
  className: _propTypes["default"].string,
  classPrefix: _propTypes["default"].string,
  dataKey: _propTypes["default"].string,
  isHeaderCell: _propTypes["default"].bool,
  width: _propTypes["default"].number,
  height: _propTypes["default"].oneOfType([_propTypes["default"].number, _propTypes["default"].func]),
  left: _propTypes["default"].number,
  headerHeight: _propTypes["default"].number,
  style: _propTypes["default"].object,
  firstColumn: _propTypes["default"].bool,
  lastColumn: _propTypes["default"].bool,
  hasChildren: _propTypes["default"].bool,
  children: _propTypes["default"].any,
  rowKey: _propTypes["default"].oneOfType([_propTypes["default"].string, _propTypes["default"].number]),
  rowIndex: _propTypes["default"].number,
  rowData: _propTypes["default"].object,
  depth: _propTypes["default"].number,
  onTreeToggle: _propTypes["default"].func,
  renderTreeToggle: _propTypes["default"].func,
  renderCell: _propTypes["default"].func,
  wordWrap: _propTypes["default"].bool,
  removed: _propTypes["default"].bool,
  treeCol: _propTypes["default"].bool,
  expanded: _propTypes["default"].bool,
  groupHeader: _propTypes["default"].node,
  groupCount: _propTypes["default"].number
};
exports.propTypes = propTypes;

var Cell =
/*#__PURE__*/
function (_React$PureComponent) {
  (0, _inheritsLoose2["default"])(Cell, _React$PureComponent);

  function Cell() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$PureComponent.call.apply(_React$PureComponent, [this].concat(args)) || this;

    _this.addPrefix = function (name) {
      return (0, _utils.prefix)(_this.props.classPrefix)(name);
    };

    _this.handleExpandClick = function (event) {
      var _this$props$onTreeTog, _this$props2;

      var _this$props = _this.props,
          rowKey = _this$props.rowKey,
          rowIndex = _this$props.rowIndex,
          rowData = _this$props.rowData;
      (_this$props$onTreeTog = (_this$props2 = _this.props).onTreeToggle) === null || _this$props$onTreeTog === void 0 ? void 0 : _this$props$onTreeTog.call(_this$props2, rowKey, rowIndex, rowData, event);
    };

    return _this;
  }

  var _proto = Cell.prototype;

  _proto.isTreeCol = function isTreeCol() {
    var _this$props3 = this.props,
        treeCol = _this$props3.treeCol,
        firstColumn = _this$props3.firstColumn;
    var hasCustomTreeCol = this.context.hasCustomTreeCol;

    if (treeCol) {
      return true;
    }

    if (!hasCustomTreeCol && firstColumn) {
      return true;
    }

    return false;
  };

  _proto.getHeight = function getHeight() {
    var _this$props4 = this.props,
        height = _this$props4.height,
        rowData = _this$props4.rowData;
    return typeof height === 'function' ? height(rowData) : height;
  };

  _proto.renderTreeNodeExpandIcon = function renderTreeNodeExpandIcon() {
    var _this$props5 = this.props,
        rowData = _this$props5.rowData,
        renderTreeToggle = _this$props5.renderTreeToggle,
        hasChildren = _this$props5.hasChildren,
        expanded = _this$props5.expanded;
    var expandButton = React.createElement("i", {
      className: this.addPrefix('expand-icon')
    });

    if (this.isTreeCol() && hasChildren) {
      return React.createElement("span", {
        role: "button",
        tabIndex: -1,
        className: this.addPrefix('expand-wrapper'),
        onClick: this.handleExpandClick
      }, renderTreeToggle ? renderTreeToggle(expandButton, rowData, expanded) : expandButton);
    }

    return null;
  };

  _proto.render = function render() {
    var _classNames, _styles, _extends2;

    var _this$props6 = this.props,
        width = _this$props6.width,
        left = _this$props6.left,
        style = _this$props6.style,
        className = _this$props6.className,
        firstColumn = _this$props6.firstColumn,
        lastColumn = _this$props6.lastColumn,
        isHeaderCell = _this$props6.isHeaderCell,
        headerHeight = _this$props6.headerHeight,
        align = _this$props6.align,
        children = _this$props6.children,
        rowData = _this$props6.rowData,
        dataKey = _this$props6.dataKey,
        rowIndex = _this$props6.rowIndex,
        renderCell = _this$props6.renderCell,
        removed = _this$props6.removed,
        wordWrap = _this$props6.wordWrap,
        classPrefix = _this$props6.classPrefix,
        depth = _this$props6.depth,
        verticalAlign = _this$props6.verticalAlign,
        expanded = _this$props6.expanded,
        rest = (0, _objectWithoutPropertiesLoose2["default"])(_this$props6, ["width", "left", "style", "className", "firstColumn", "lastColumn", "isHeaderCell", "headerHeight", "align", "children", "rowData", "dataKey", "rowIndex", "renderCell", "removed", "wordWrap", "classPrefix", "depth", "verticalAlign", "expanded"]);

    if (removed) {
      return null;
    }

    var classes = (0, _classnames["default"])(classPrefix, className, (_classNames = {}, _classNames[this.addPrefix('expanded')] = expanded && this.isTreeCol(), _classNames[this.addPrefix('first')] = firstColumn, _classNames[this.addPrefix('last')] = lastColumn, _classNames));
    var rtl = this.context.rtl;
    var nextHeight = isHeaderCell ? headerHeight : this.getHeight();
    var styles = (_styles = {
      width: width,
      height: nextHeight,
      zIndex: depth
    }, _styles[rtl ? 'right' : 'left'] = left, _styles);
    var contentStyles = (0, _extends3["default"])((_extends2 = {
      width: width,
      height: nextHeight,
      textAlign: align
    }, _extends2[rtl ? 'paddingRight' : 'paddingLeft'] = this.isTreeCol() ? depth * _constants.LAYER_WIDTH + 10 : null, _extends2), style);

    if (verticalAlign) {
      contentStyles.display = 'table-cell';
      contentStyles.verticalAlign = verticalAlign;
    }

    var cellContent = (0, _utils.isNullOrUndefined)(children) && rowData ? rowData[dataKey] : children;

    if (typeof children === 'function') {
      var getChildren = children;
      cellContent = getChildren(rowData, rowIndex);
    }

    var unhandledProps = (0, _utils.getUnhandledProps)(Cell, (0, _utils.getUnhandledProps)(_Column["default"], rest));
    var cell = renderCell ? renderCell(cellContent) : cellContent;
    var content = wordWrap ? React.createElement("div", {
      className: this.addPrefix('wrap')
    }, this.renderTreeNodeExpandIcon(), cell) : React.createElement(React.Fragment, null, this.renderTreeNodeExpandIcon(), cell);
    return React.createElement("div", (0, _extends3["default"])({}, unhandledProps, {
      className: classes,
      style: styles
    }), React.createElement("div", {
      className: this.addPrefix('content'),
      style: contentStyles
    }, content));
  };

  return Cell;
}(React.PureComponent);

Cell.contextType = _TableContext["default"];
Cell.propTypes = propTypes;
Cell.defaultProps = {
  classPrefix: (0, _utils.defaultClassPrefix)('table-cell'),
  headerHeight: 36,
  depth: 0,
  height: 36,
  width: 0,
  left: 0
};
var _default = Cell;
exports["default"] = _default;