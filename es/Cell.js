import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { LAYER_WIDTH } from './constants';
import { isNullOrUndefined, defaultClassPrefix, getUnhandledProps, prefix } from './utils';
import TableContext from './TableContext';
import Column from './Column';
export var propTypes = {
  align: PropTypes.oneOf(['left', 'center', 'right']),
  verticalAlign: PropTypes.oneOf(['top', 'middle', 'bottom']),
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  dataKey: PropTypes.string,
  isHeaderCell: PropTypes.bool,
  width: PropTypes.number,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
  left: PropTypes.number,
  headerHeight: PropTypes.number,
  style: PropTypes.object,
  firstColumn: PropTypes.bool,
  lastColumn: PropTypes.bool,
  hasChildren: PropTypes.bool,
  children: PropTypes.any,
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  rowIndex: PropTypes.number,
  rowData: PropTypes.object,
  depth: PropTypes.number,
  onTreeToggle: PropTypes.func,
  renderTreeToggle: PropTypes.func,
  renderCell: PropTypes.func,
  wordWrap: PropTypes.bool,
  removed: PropTypes.bool,
  treeCol: PropTypes.bool,
  expanded: PropTypes.bool,
  groupHeader: PropTypes.node,
  groupCount: PropTypes.number
};

var Cell =
/*#__PURE__*/
function (_React$PureComponent) {
  _inheritsLoose(Cell, _React$PureComponent);

  function Cell() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$PureComponent.call.apply(_React$PureComponent, [this].concat(args)) || this;

    _this.addPrefix = function (name) {
      return prefix(_this.props.classPrefix)(name);
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
        rest = _objectWithoutPropertiesLoose(_this$props6, ["width", "left", "style", "className", "firstColumn", "lastColumn", "isHeaderCell", "headerHeight", "align", "children", "rowData", "dataKey", "rowIndex", "renderCell", "removed", "wordWrap", "classPrefix", "depth", "verticalAlign", "expanded"]);

    if (removed) {
      return null;
    }

    var classes = classNames(classPrefix, className, (_classNames = {}, _classNames[this.addPrefix('expanded')] = expanded && this.isTreeCol(), _classNames[this.addPrefix('first')] = firstColumn, _classNames[this.addPrefix('last')] = lastColumn, _classNames));
    var rtl = this.context.rtl;
    var nextHeight = isHeaderCell ? headerHeight : this.getHeight();
    var styles = (_styles = {
      width: width,
      height: nextHeight,
      zIndex: depth
    }, _styles[rtl ? 'right' : 'left'] = left, _styles);

    var contentStyles = _extends((_extends2 = {
      width: width,
      height: nextHeight,
      textAlign: align
    }, _extends2[rtl ? 'paddingRight' : 'paddingLeft'] = this.isTreeCol() ? depth * LAYER_WIDTH + 10 : null, _extends2), style);

    if (verticalAlign) {
      contentStyles.display = 'table-cell';
      contentStyles.verticalAlign = verticalAlign;
    }

    var cellContent = isNullOrUndefined(children) && rowData ? rowData[dataKey] : children;

    if (typeof children === 'function') {
      var getChildren = children;
      cellContent = getChildren(rowData, rowIndex);
    }

    var unhandledProps = getUnhandledProps(Cell, getUnhandledProps(Column, rest));
    var cell = renderCell ? renderCell(cellContent) : cellContent;
    var content = wordWrap ? React.createElement("div", {
      className: this.addPrefix('wrap')
    }, this.renderTreeNodeExpandIcon(), cell) : React.createElement(React.Fragment, null, this.renderTreeNodeExpandIcon(), cell);
    return React.createElement("div", _extends({}, unhandledProps, {
      className: classes,
      style: styles
    }), React.createElement("div", {
      className: this.addPrefix('content'),
      style: contentStyles
    }, content));
  };

  return Cell;
}(React.PureComponent);

Cell.contextType = TableContext;
Cell.propTypes = propTypes;
Cell.defaultProps = {
  classPrefix: defaultClassPrefix('table-cell'),
  headerHeight: 36,
  depth: 0,
  height: 36,
  width: 0,
  left: 0
};
export default Cell;