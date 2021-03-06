import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import _extends from "@babel/runtime/helpers/esm/extends";
import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import isFunction from 'lodash/isFunction';
import flatten from 'lodash/flatten';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import eq from 'lodash/eq';
import omit from 'lodash/omit';
import merge from 'lodash/merge';
import bindElementResize, { unbind as unbindElementResize } from 'element-resize-event';
import { getTranslateDOMPositionXY } from 'dom-lib/lib/transition/translateDOMPositionXY';
import { addStyle, getWidth, getHeight, WheelHandler, scrollLeft, scrollTop, on, getOffset } from 'dom-lib';
import Row from './Row';
import CellGroup from './CellGroup';
import Scrollbar from './Scrollbar';
import TableContext from './TableContext';
import { SCROLLBAR_WIDTH, CELL_PADDING_HEIGHT } from './constants';
import { getTotalByColumns, mergeCells, getUnhandledProps, defaultClassPrefix, toggleClass, flattenData, prefix, requestAnimationTimeout, cancelAnimationTimeout, isRTL as _isRTL, isNumberOrTrue, findRowKeys, findAllParents, shouldShowRowByExpanded, resetLeftForCells } from './utils';
import ColumnGroup from './ColumnGroup';
var SORT_TYPE = {
  DESC: 'desc',
  ASC: 'asc'
};

var Table =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(Table, _React$Component);

  Table.getDerivedStateFromProps = function getDerivedStateFromProps(props, state) {
    if (props.data !== state.cacheData) {
      return {
        cacheData: props.data,
        data: props.isTree ? flattenData(props.data) : props.data
      };
    }

    return null;
  };

  function Table(props) {
    var _this;

    _this = _React$Component.call(this, props) || this;
    _this.translateDOMPositionXY = null;
    _this.scrollListener = null;
    _this.tableRef = void 0;
    _this.scrollbarYRef = void 0;
    _this.scrollbarXRef = void 0;
    _this.tableBodyRef = void 0;
    _this.affixHeaderWrapperRef = void 0;
    _this.mouseAreaRef = void 0;
    _this.headerWrapperRef = void 0;
    _this.tableHeaderRef = void 0;
    _this.wheelWrapperRef = void 0;
    _this.tableRows = {};
    _this.mounted = false;
    _this.disableEventsTimeoutId = null;
    _this.scrollY = 0;
    _this.scrollX = 0;
    _this.wheelHandler = void 0;
    _this.minScrollY = void 0;
    _this.minScrollX = void 0;
    _this.mouseArea = void 0;
    _this.touchX = void 0;
    _this.touchY = void 0;
    _this.wheelListener = void 0;
    _this.touchStartListener = void 0;
    _this.touchMoveListener = void 0;
    _this._cacheCells = null;
    _this._cacheChildrenSize = 0;
    _this._visibleRows = [];

    _this.listenWheel = function (deltaX, deltaY) {
      var _this$scrollbarXRef$c, _this$scrollbarXRef$c2, _this$scrollbarYRef$c, _this$scrollbarYRef$c2;

      _this.handleWheel(deltaX, deltaY);

      (_this$scrollbarXRef$c = _this.scrollbarXRef.current) === null || _this$scrollbarXRef$c === void 0 ? void 0 : (_this$scrollbarXRef$c2 = _this$scrollbarXRef$c.onWheelScroll) === null || _this$scrollbarXRef$c2 === void 0 ? void 0 : _this$scrollbarXRef$c2.call(_this$scrollbarXRef$c, deltaX);
      (_this$scrollbarYRef$c = _this.scrollbarYRef.current) === null || _this$scrollbarYRef$c === void 0 ? void 0 : (_this$scrollbarYRef$c2 = _this$scrollbarYRef$c.onWheelScroll) === null || _this$scrollbarYRef$c2 === void 0 ? void 0 : _this$scrollbarYRef$c2.call(_this$scrollbarYRef$c, deltaY);
    };

    _this.setOffsetByAffix = function () {
      var _this$headerWrapperRe, _this$tableRef;

      var _this$props = _this.props,
          affixHeader = _this$props.affixHeader,
          affixHorizontalScrollbar = _this$props.affixHorizontalScrollbar;
      var headerNode = (_this$headerWrapperRe = _this.headerWrapperRef) === null || _this$headerWrapperRe === void 0 ? void 0 : _this$headerWrapperRe.current;

      if (isNumberOrTrue(affixHeader) && headerNode) {
        _this.setState(function () {
          return {
            headerOffset: getOffset(headerNode)
          };
        });
      }

      var tableNode = (_this$tableRef = _this.tableRef) === null || _this$tableRef === void 0 ? void 0 : _this$tableRef.current;

      if (isNumberOrTrue(affixHorizontalScrollbar) && tableNode) {
        _this.setState(function () {
          return {
            tableOffset: getOffset(tableNode)
          };
        });
      }
    };

    _this.handleWindowScroll = function () {
      var _this$props2 = _this.props,
          affixHeader = _this$props2.affixHeader,
          affixHorizontalScrollbar = _this$props2.affixHorizontalScrollbar;

      if (isNumberOrTrue(affixHeader)) {
        _this.affixTableHeader();
      }

      if (isNumberOrTrue(affixHorizontalScrollbar)) {
        _this.affixHorizontalScrollbar();
      }
    };

    _this.affixHorizontalScrollbar = function () {
      var _this$scrollbarXRef, _this$scrollbarXRef$c3, _this$scrollbarXRef$c4;

      var scrollY = window.scrollY || window.pageYOffset;
      var windowHeight = getHeight(window);

      var height = _this.getTableHeight();

      var _this$state = _this.state,
          tableOffset = _this$state.tableOffset,
          fixedHorizontalScrollbar = _this$state.fixedHorizontalScrollbar;
      var affixHorizontalScrollbar = _this.props.affixHorizontalScrollbar;

      var headerHeight = _this.getTableHeaderHeight();

      var bottom = typeof affixHorizontalScrollbar === 'number' ? affixHorizontalScrollbar : 0;
      var fixedScrollbar = scrollY + windowHeight < height + (tableOffset.top + bottom) && scrollY + windowHeight - headerHeight > tableOffset.top + bottom;

      if (((_this$scrollbarXRef = _this.scrollbarXRef) === null || _this$scrollbarXRef === void 0 ? void 0 : (_this$scrollbarXRef$c3 = _this$scrollbarXRef.current) === null || _this$scrollbarXRef$c3 === void 0 ? void 0 : (_this$scrollbarXRef$c4 = _this$scrollbarXRef$c3.barRef) === null || _this$scrollbarXRef$c4 === void 0 ? void 0 : _this$scrollbarXRef$c4.current) && fixedHorizontalScrollbar !== fixedScrollbar) {
        _this.setState({
          fixedHorizontalScrollbar: fixedScrollbar
        });
      }
    };

    _this.affixTableHeader = function () {
      var affixHeader = _this.props.affixHeader;
      var top = typeof affixHeader === 'number' ? affixHeader : 0;
      var _this$state2 = _this.state,
          headerOffset = _this$state2.headerOffset,
          contentHeight = _this$state2.contentHeight;
      var scrollY = window.scrollY || window.pageYOffset;
      var fixedHeader = scrollY - (headerOffset.top - top) >= 0 && scrollY < headerOffset.top - top + contentHeight;

      if (_this.affixHeaderWrapperRef.current) {
        toggleClass(_this.affixHeaderWrapperRef.current, 'fixed', fixedHeader);
      }
    };

    _this.handleSortColumn = function (dataKey) {
      var _this$props$onSortCol, _this$props3;

      var sortType = _this.getSortType();

      if (_this.props.sortColumn === dataKey) {
        sortType = sortType === SORT_TYPE.ASC ? SORT_TYPE.DESC : SORT_TYPE.ASC;

        _this.setState({
          sortType: sortType
        });
      }

      (_this$props$onSortCol = (_this$props3 = _this.props).onSortColumn) === null || _this$props$onSortCol === void 0 ? void 0 : _this$props$onSortCol.call(_this$props3, dataKey, sortType);
    };

    _this.handleColumnResizeEnd = function (columnWidth, _cursorDelta, dataKey, index) {
      var _this$setState;

      _this._cacheCells = null;
      console.log(index);

      _this.setState((_this$setState = {
        isColumnResizing: false
      }, _this$setState[dataKey + "_" + index + "_width"] = columnWidth, _this$setState));

      addStyle(_this.mouseAreaRef.current, {
        display: 'none'
      });
    };

    _this.handleColumnResizeStart = function (width, left, fixed) {
      _this.setState({
        isColumnResizing: true
      });

      _this.handleColumnResizeMove(width, left, fixed);
    };

    _this.handleColumnResizeMove = function (width, left, fixed) {
      var _addStyle;

      var mouseAreaLeft = width + left;
      var x = mouseAreaLeft;
      var dir = 'left';

      if (_this.isRTL()) {
        mouseAreaLeft += _this.minScrollX + SCROLLBAR_WIDTH;
        dir = 'right';
      }

      if (!fixed) {
        x = mouseAreaLeft + (_this.isRTL() ? -_this.scrollX : _this.scrollX);
      }

      addStyle(_this.mouseAreaRef.current, (_addStyle = {
        display: 'block'
      }, _addStyle[dir] = x + "px", _addStyle));
    };

    _this.handleTreeToggle = function (rowKey, _rowIndex, rowData) {
      var _this$props$onExpandC, _this$props4;

      var expandedRowKeys = _this.getExpandedRowKeys();

      var open = false;
      var nextExpandedRowKeys = [];

      for (var i = 0; i < expandedRowKeys.length; i++) {
        var _key = expandedRowKeys[i];

        if (_key === rowKey) {
          open = true;
        } else {
          nextExpandedRowKeys.push(_key);
        }
      }

      if (!open) {
        nextExpandedRowKeys.push(rowKey);
      }

      _this.setState({
        expandedRowKeys: nextExpandedRowKeys
      });

      (_this$props$onExpandC = (_this$props4 = _this.props).onExpandChange) === null || _this$props$onExpandC === void 0 ? void 0 : _this$props$onExpandC.call(_this$props4, !open, rowData);
    };

    _this.handleScrollX = function (delta) {
      _this.handleWheel(delta, 0);
    };

    _this.handleScrollY = function (delta) {
      _this.handleWheel(0, delta);
    };

    _this.handleWheel = function (deltaX, deltaY) {
      var _this$props5 = _this.props,
          onScroll = _this$props5.onScroll,
          virtualized = _this$props5.virtualized;
      var _this$state3 = _this.state,
          contentWidth = _this$state3.contentWidth,
          width = _this$state3.width;

      if (!_this.tableRef.current) {
        return;
      }

      var nextScrollX = contentWidth <= width ? 0 : _this.scrollX - deltaX;
      var nextScrollY = _this.scrollY - deltaY;
      _this.scrollY = Math.min(0, nextScrollY < _this.minScrollY ? _this.minScrollY : nextScrollY);
      _this.scrollX = Math.min(0, nextScrollX < _this.minScrollX ? _this.minScrollX : nextScrollX);

      _this.updatePosition();

      onScroll === null || onScroll === void 0 ? void 0 : onScroll(_this.scrollX, _this.scrollY);

      if (virtualized) {
        _this.setState({
          isScrolling: true,
          scrollY: _this.scrollY
        });

        if (_this.disableEventsTimeoutId) {
          cancelAnimationTimeout(_this.disableEventsTimeoutId);
        }

        _this.disableEventsTimeoutId = requestAnimationTimeout(_this.debounceScrollEndedCallback, 150);
      }
    };

    _this.debounceScrollEndedCallback = function () {
      _this.disableEventsTimeoutId = null;

      _this.setState({
        isScrolling: false
      });
    };

    _this.handleTouchStart = function (event) {
      var _this$props$onTouchSt, _this$props6;

      if (event.touches) {
        var _event$touches$ = event.touches[0],
            pageX = _event$touches$.pageX,
            pageY = _event$touches$.pageY;
        _this.touchX = pageX;
        _this.touchY = pageY;
      }

      (_this$props$onTouchSt = (_this$props6 = _this.props).onTouchStart) === null || _this$props$onTouchSt === void 0 ? void 0 : _this$props$onTouchSt.call(_this$props6, event);
    };

    _this.handleTouchMove = function (event) {
      var _this$props$onTouchMo, _this$props7;

      var autoHeight = _this.props.autoHeight;

      if (event.touches) {
        var _event$preventDefault, _this$scrollbarXRef$c5, _this$scrollbarXRef$c6, _this$scrollbarYRef$c3, _this$scrollbarYRef$c4;

        var _event$touches$2 = event.touches[0],
            pageX = _event$touches$2.pageX,
            pageY = _event$touches$2.pageY;
        var deltaX = _this.touchX - pageX;
        var deltaY = autoHeight ? 0 : _this.touchY - pageY;

        if (!_this.shouldHandleWheelY(deltaY) && !_this.shouldHandleWheelX(deltaX)) {
          return;
        }

        (_event$preventDefault = event.preventDefault) === null || _event$preventDefault === void 0 ? void 0 : _event$preventDefault.call(event);

        _this.handleWheel(deltaX, deltaY);

        (_this$scrollbarXRef$c5 = _this.scrollbarXRef.current) === null || _this$scrollbarXRef$c5 === void 0 ? void 0 : (_this$scrollbarXRef$c6 = _this$scrollbarXRef$c5.onWheelScroll) === null || _this$scrollbarXRef$c6 === void 0 ? void 0 : _this$scrollbarXRef$c6.call(_this$scrollbarXRef$c5, deltaX);
        (_this$scrollbarYRef$c3 = _this.scrollbarYRef.current) === null || _this$scrollbarYRef$c3 === void 0 ? void 0 : (_this$scrollbarYRef$c4 = _this$scrollbarYRef$c3.onWheelScroll) === null || _this$scrollbarYRef$c4 === void 0 ? void 0 : _this$scrollbarYRef$c4.call(_this$scrollbarYRef$c3, deltaY);
        _this.touchX = pageX;
        _this.touchY = pageY;
      }

      (_this$props$onTouchMo = (_this$props7 = _this.props).onTouchMove) === null || _this$props$onTouchMo === void 0 ? void 0 : _this$props$onTouchMo.call(_this$props7, event);
    };

    _this.handleBodyScroll = function (event) {
      if (event.target !== _this.tableBodyRef.current) {
        return;
      }

      var left = scrollLeft(event.target);
      var top = scrollTop(event.target);

      if (top === 0 && left === 0) {
        return;
      }

      _this.listenWheel(left, top);

      scrollLeft(event.target, 0);
      scrollTop(event.target, 0);
    };

    _this.shouldHandleWheelX = function (delta) {
      var _this$props8 = _this.props,
          disabledScroll = _this$props8.disabledScroll,
          loading = _this$props8.loading;

      if (delta === 0 || disabledScroll || loading) {
        return false;
      }

      return true;
    };

    _this.shouldHandleWheelY = function (delta) {
      var _this$props9 = _this.props,
          disabledScroll = _this$props9.disabledScroll,
          loading = _this$props9.loading;

      if (delta === 0 || disabledScroll || loading) {
        return false;
      }

      return delta >= 0 && _this.scrollY > _this.minScrollY || delta < 0 && _this.scrollY < 0;
    };

    _this.addPrefix = function (name) {
      return prefix(_this.props.classPrefix)(name);
    };

    _this.calculateTableWidth = function () {
      var _this$tableRef2;

      var table = (_this$tableRef2 = _this.tableRef) === null || _this$tableRef2 === void 0 ? void 0 : _this$tableRef2.current;
      var width = _this.state.width;

      if (table) {
        var nextWidth = getWidth(table);

        if (width !== nextWidth) {
          var _this$scrollbarXRef2, _this$scrollbarXRef2$;

          _this.scrollX = 0;
          (_this$scrollbarXRef2 = _this.scrollbarXRef) === null || _this$scrollbarXRef2 === void 0 ? void 0 : (_this$scrollbarXRef2$ = _this$scrollbarXRef2.current) === null || _this$scrollbarXRef2$ === void 0 ? void 0 : _this$scrollbarXRef2$.resetScrollBarPosition();
        }

        _this._cacheCells = null;

        _this.setState({
          width: nextWidth
        });
      }

      _this.setOffsetByAffix();
    };

    _this.scrollTop = function (top) {
      var _this$scrollbarYRef, _this$scrollbarYRef$c5, _this$scrollbarYRef$c6;

      if (top === void 0) {
        top = 0;
      }

      var _this$getControlledSc = _this.getControlledScrollTopValue(top),
          scrollY = _this$getControlledSc[0],
          handleScrollY = _this$getControlledSc[1];

      _this.scrollY = scrollY;
      (_this$scrollbarYRef = _this.scrollbarYRef) === null || _this$scrollbarYRef === void 0 ? void 0 : (_this$scrollbarYRef$c5 = _this$scrollbarYRef.current) === null || _this$scrollbarYRef$c5 === void 0 ? void 0 : (_this$scrollbarYRef$c6 = _this$scrollbarYRef$c5.resetScrollBarPosition) === null || _this$scrollbarYRef$c6 === void 0 ? void 0 : _this$scrollbarYRef$c6.call(_this$scrollbarYRef$c5, handleScrollY);

      _this.updatePosition();
      /**
       * 当开启 virtualized，调用 scrollTop 后会出现白屏现象，
       * 原因是直接操作 DOM 的坐标，但是组件没有重新渲染，需要调用 forceUpdate 重新进入 render。
       * Fix: rsuite#1044
       */


      if (_this.props.virtualized && _this.state.contentHeight > _this.props.height) {
        _this.forceUpdate();
      }
    };

    _this.scrollLeft = function (left) {
      var _this$scrollbarXRef3, _this$scrollbarXRef3$, _this$scrollbarXRef3$2;

      if (left === void 0) {
        left = 0;
      }

      var _this$getControlledSc2 = _this.getControlledScrollLeftValue(left),
          scrollX = _this$getControlledSc2[0],
          handleScrollX = _this$getControlledSc2[1];

      _this.scrollX = scrollX;
      (_this$scrollbarXRef3 = _this.scrollbarXRef) === null || _this$scrollbarXRef3 === void 0 ? void 0 : (_this$scrollbarXRef3$ = _this$scrollbarXRef3.current) === null || _this$scrollbarXRef3$ === void 0 ? void 0 : (_this$scrollbarXRef3$2 = _this$scrollbarXRef3$.resetScrollBarPosition) === null || _this$scrollbarXRef3$2 === void 0 ? void 0 : _this$scrollbarXRef3$2.call(_this$scrollbarXRef3$, handleScrollX);

      _this.updatePosition();
    };

    _this.scrollTo = function (coord) {
      var _ref = coord || {},
          x = _ref.x,
          y = _ref.y;

      if (typeof x === 'number') {
        _this.scrollLeft(x);
      }

      if (typeof y === 'number') {
        _this.scrollTop(y);
      }
    };

    _this.bindTableRowsRef = function (index, rowData) {
      return function (ref) {
        if (ref) {
          _this.tableRows[index] = [ref, rowData];
        }
      };
    };

    _this.bindRowClick = function (rowData) {
      return function (event) {
        var _this$props$onRowClic, _this$props10;

        (_this$props$onRowClic = (_this$props10 = _this.props).onRowClick) === null || _this$props$onRowClic === void 0 ? void 0 : _this$props$onRowClic.call(_this$props10, rowData, event);
      };
    };

    _this.bindRowDoubleClick = function (rowData) {
      return function (event) {
        var _this$props$onRowDoub, _this$props11;

        (_this$props$onRowDoub = (_this$props11 = _this.props).onRowDoubleClick) === null || _this$props$onRowDoub === void 0 ? void 0 : _this$props$onRowDoub.call(_this$props11, rowData, event);
      };
    };

    _this.bindRowContextMenu = function (rowData) {
      return function (event) {
        var _this$props$onRowCont, _this$props12;

        (_this$props$onRowCont = (_this$props12 = _this.props).onRowContextMenu) === null || _this$props$onRowCont === void 0 ? void 0 : _this$props$onRowCont.call(_this$props12, rowData, event);
      };
    };

    var _width = props.width,
        data = props.data,
        _rowKey = props.rowKey,
        defaultExpandAllRows = props.defaultExpandAllRows,
        renderRowExpanded = props.renderRowExpanded,
        defaultExpandedRowKeys = props.defaultExpandedRowKeys,
        _props$children = props.children,
        children = _props$children === void 0 ? [] : _props$children,
        isTree = props.isTree,
        defaultSortType = props.defaultSortType;

    var _expandedRowKeys = defaultExpandAllRows ? findRowKeys(data, _rowKey, isFunction(renderRowExpanded)) : defaultExpandedRowKeys || [];

    var shouldFixedColumn = Array.from(children).some(function (child) {
      return child && child.props && child.props.fixed;
    });

    if (isTree && !_rowKey) {
      throw new Error('The `rowKey` is required when set isTree');
    }

    _this.state = {
      expandedRowKeys: _expandedRowKeys,
      shouldFixedColumn: shouldFixedColumn,
      cacheData: data,
      data: isTree ? flattenData(data) : data,
      width: _width || 0,
      columnWidth: 0,
      dataKey: 0,
      contentHeight: 0,
      contentWidth: 0,
      tableRowsMaxHeight: [],
      sortType: defaultSortType,
      scrollY: 0,
      isScrolling: false,
      fixedHeader: false
    };
    _this.scrollY = 0;
    _this.scrollX = 0;
    _this.wheelHandler = new WheelHandler(_this.listenWheel, _this.shouldHandleWheelX, _this.shouldHandleWheelY, false);
    _this._cacheChildrenSize = flatten(children).length;
    _this.translateDOMPositionXY = getTranslateDOMPositionXY({
      enable3DTransform: props.translate3d
    });
    _this.tableRef = React.createRef();
    _this.scrollbarYRef = React.createRef();
    _this.scrollbarXRef = React.createRef();
    _this.tableBodyRef = React.createRef();
    _this.affixHeaderWrapperRef = React.createRef();
    _this.mouseAreaRef = React.createRef();
    _this.headerWrapperRef = React.createRef();
    _this.wheelWrapperRef = React.createRef();
    _this.tableHeaderRef = React.createRef();
    return _this;
  }

  var _proto = Table.prototype;

  _proto.componentDidMount = function componentDidMount() {
    var _this$props14, _this$props14$bodyRef;

    this.calculateTableWidth();
    this.calculateTableContextHeight();
    this.calculateRowMaxHeight();
    this.setOffsetByAffix();
    this.initPosition();
    bindElementResize(this.tableRef.current, debounce(this.calculateTableWidth, 400));
    var options = {
      passive: false
    };
    var tableBody = this.tableBodyRef.current;

    if (tableBody) {
      this.wheelListener = on(tableBody, 'wheel', this.wheelHandler.onWheel, options);
      this.touchStartListener = on(tableBody, 'touchstart', this.handleTouchStart, options);
      this.touchMoveListener = on(tableBody, 'touchmove', this.handleTouchMove, options);
    }

    var _this$props13 = this.props,
        affixHeader = _this$props13.affixHeader,
        affixHorizontalScrollbar = _this$props13.affixHorizontalScrollbar;

    if (isNumberOrTrue(affixHeader) || isNumberOrTrue(affixHorizontalScrollbar)) {
      this.scrollListener = on(window, 'scroll', this.handleWindowScroll);
    }

    (_this$props14 = this.props) === null || _this$props14 === void 0 ? void 0 : (_this$props14$bodyRef = _this$props14.bodyRef) === null || _this$props14$bodyRef === void 0 ? void 0 : _this$props14$bodyRef.call(_this$props14, this.wheelWrapperRef.current);
  };

  _proto.shouldComponentUpdate = function shouldComponentUpdate(nextProps, nextState) {
    var _cacheChildrenSize = flatten(nextProps.children || []).length;
    /**
     * 单元格列的信息在初始化后会被缓存，在某些属性被更新以后，需要清除缓存。
     */

    if (_cacheChildrenSize !== this._cacheChildrenSize) {
      this._cacheChildrenSize = _cacheChildrenSize;
      this._cacheCells = null;
    } else if (this.props.children !== nextProps.children || this.props.sortColumn !== nextProps.sortColumn || this.props.sortType !== nextProps.sortType) {
      this._cacheCells = null;
    }

    return !eq(this.props, nextProps) || !isEqual(this.state, nextState);
  };

  _proto.componentDidUpdate = function componentDidUpdate(prevProps) {
    this.calculateTableContextHeight(prevProps);
    this.calculateTableContentWidth(prevProps);
    this.calculateRowMaxHeight();

    if (prevProps.data !== this.props.data) {
      var _this$props$onDataUpd, _this$props15;

      (_this$props$onDataUpd = (_this$props15 = this.props).onDataUpdated) === null || _this$props$onDataUpd === void 0 ? void 0 : _this$props$onDataUpd.call(_this$props15, this.props.data, this.scrollTo);

      if (this.props.shouldUpdateScroll) {
        this.scrollTo({
          x: 0,
          y: 0
        });
      }
    } else {
      this.updatePosition();
    }
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    var _this$wheelListener, _this$touchStartListe, _this$touchMoveListen, _this$scrollListener;

    this.wheelHandler = null;

    if (this.tableRef.current) {
      unbindElementResize(this.tableRef.current);
    }

    (_this$wheelListener = this.wheelListener) === null || _this$wheelListener === void 0 ? void 0 : _this$wheelListener.off();
    (_this$touchStartListe = this.touchStartListener) === null || _this$touchStartListe === void 0 ? void 0 : _this$touchStartListe.off();
    (_this$touchMoveListen = this.touchMoveListener) === null || _this$touchMoveListen === void 0 ? void 0 : _this$touchMoveListen.off();
    (_this$scrollListener = this.scrollListener) === null || _this$scrollListener === void 0 ? void 0 : _this$scrollListener.off();
  };

  _proto.getExpandedRowKeys = function getExpandedRowKeys() {
    var expandedRowKeys = this.props.expandedRowKeys;
    return typeof expandedRowKeys === 'undefined' ? this.state.expandedRowKeys : expandedRowKeys;
  };

  _proto.getSortType = function getSortType() {
    var sortType = this.props.sortType;
    return typeof sortType === 'undefined' ? this.state.sortType : sortType;
  };

  _proto.getScrollCellGroups = function getScrollCellGroups() {
    var _this$tableRef$curren;

    return (_this$tableRef$curren = this.tableRef.current) === null || _this$tableRef$curren === void 0 ? void 0 : _this$tableRef$curren.querySelectorAll("." + this.addPrefix('cell-group-scroll'));
  };

  _proto.getFixedLeftCellGroups = function getFixedLeftCellGroups() {
    var _this$tableRef$curren2;

    return (_this$tableRef$curren2 = this.tableRef.current) === null || _this$tableRef$curren2 === void 0 ? void 0 : _this$tableRef$curren2.querySelectorAll("." + this.addPrefix('cell-group-fixed-left'));
  };

  _proto.getFixedRightCellGroups = function getFixedRightCellGroups() {
    var _this$tableRef$curren3;

    return (_this$tableRef$curren3 = this.tableRef.current) === null || _this$tableRef$curren3 === void 0 ? void 0 : _this$tableRef$curren3.querySelectorAll("." + this.addPrefix('cell-group-fixed-right'));
  };

  _proto.isRTL = function isRTL() {
    return this.props.rtl || _isRTL();
  };

  _proto.getRowHeight = function getRowHeight(rowData) {
    if (rowData === void 0) {
      rowData = {};
    }

    var rowHeight = this.props.rowHeight;
    return typeof rowHeight === 'function' ? rowHeight(rowData) : rowHeight;
  }
  /**
   * 获取表头高度
   */
  ;

  _proto.getTableHeaderHeight = function getTableHeaderHeight() {
    var _this$props16 = this.props,
        headerHeight = _this$props16.headerHeight,
        showHeader = _this$props16.showHeader;
    return showHeader ? headerHeight : 0;
  }
  /**
   * 获取 Table 需要渲染的高度
   */
  ;

  _proto.getTableHeight = function getTableHeight() {
    var contentHeight = this.state.contentHeight;
    var _this$props17 = this.props,
        minHeight = _this$props17.minHeight,
        height = _this$props17.height,
        autoHeight = _this$props17.autoHeight,
        data = _this$props17.data;
    var headerHeight = this.getTableHeaderHeight();

    if (data.length === 0 && autoHeight) {
      return height;
    }

    return autoHeight ? Math.max(headerHeight + contentHeight, minHeight) : height;
  }
  /**
   * 获取 columns ReactElement 数组
   * - 处理 children 中存在 <Column> 数组的情况
   * - 过滤 children 中的空项
   */
  ;

  _proto.getTableColumns = function getTableColumns() {
    var children = this.props.children;

    if (!Array.isArray(children)) {
      return children;
    }

    var flattenColumns = children.map(function (column) {
      if ((column === null || column === void 0 ? void 0 : column.type) === ColumnGroup) {
        var _ref2 = column === null || column === void 0 ? void 0 : column.props,
            header = _ref2.header,
            childColumns = _ref2.children,
            align = _ref2.align,
            fixed = _ref2.fixed,
            verticalAlign = _ref2.verticalAlign;

        return childColumns.map(function (childColumn, index) {
          // 把 ColumnGroup 设置的属性覆盖到 Column
          var groupCellProps = {
            align: align,
            fixed: fixed,
            verticalAlign: verticalAlign
          };
          /**
           * 为分组中的第一列设置属性:
           * groupCount: 分组子项个数
           * groupHeader: 分组标题
           * resizable: 设置为不可自定义列宽
           */

          if (index === 0) {
            groupCellProps.groupCount = childColumns.length;
            groupCellProps.groupHeader = header;
            groupCellProps.resizable = false;
          }

          return React.cloneElement(childColumn, groupCellProps);
        });
      }

      return column;
    }); // 把 Columns 中的数组，展平为一维数组，计算 lastColumn 与 firstColumn。

    return flatten(flattenColumns).filter(function (col) {
      return col;
    });
  };

  _proto.getCellDescriptor = function getCellDescriptor() {
    var _this2 = this;

    if (this._cacheCells) {
      return this._cacheCells;
    }

    var hasCustomTreeCol = false;
    var left = 0; // Cell left margin

    var headerCells = []; // Table header cell

    var bodyCells = []; // Table body cell

    var children = this.props.children;

    if (!children) {
      this._cacheCells = {
        headerCells: headerCells,
        bodyCells: bodyCells,
        hasCustomTreeCol: hasCustomTreeCol,
        allColumnsWidth: left
      };
      return this._cacheCells;
    }

    var columns = this.getTableColumns();
    var tableWidth = this.state.width;
    var _this$props18 = this.props,
        sortColumn = _this$props18.sortColumn,
        rowHeight = _this$props18.rowHeight,
        showHeader = _this$props18.showHeader;

    var _getTotalByColumns = getTotalByColumns(columns),
        totalFlexGrow = _getTotalByColumns.totalFlexGrow,
        totalWidth = _getTotalByColumns.totalWidth;

    var headerHeight = this.getTableHeaderHeight();
    React.Children.forEach(columns, function (column, index) {
      if (React.isValidElement(column)) {
        var columnChildren = column.props.children;
        var _column$props = column.props,
            width = _column$props.width,
            resizable = _column$props.resizable,
            flexGrow = _column$props.flexGrow,
            minWidth = _column$props.minWidth,
            onResize = _column$props.onResize,
            treeCol = _column$props.treeCol;

        if (treeCol) {
          hasCustomTreeCol = true;
        }

        if (resizable && flexGrow) {
          console.warn("Cannot set 'resizable' and 'flexGrow' together in <Column>, column index: " + index);
        }

        if (columnChildren.length !== 2) {
          throw new Error("Component <HeaderCell> and <Cell> is required, column index: " + index + " ");
        }

        var nextWidth = _this2.state[columnChildren[1].props.dataKey + "_" + index + "_width"] || width || 0;

        if (tableWidth && flexGrow && totalFlexGrow) {
          nextWidth = Math.max((tableWidth - totalWidth) / totalFlexGrow * flexGrow, minWidth || 60);
        }

        var cellProps = _extends({}, omit(column.props, ['children']), {
          left: left,
          index: index,
          headerHeight: headerHeight,
          key: index,
          width: nextWidth,
          height: rowHeight,
          firstColumn: index === 0,
          lastColumn: index === columns.length - 1
        });

        if (showHeader && headerHeight) {
          var headerCellProps = {
            dataKey: columnChildren[1].props.dataKey,
            isHeaderCell: true,
            sortable: column.props.sortable,
            onSortColumn: _this2.handleSortColumn,
            sortType: _this2.getSortType(),
            sortColumn: sortColumn,
            flexGrow: flexGrow
          };

          if (resizable) {
            merge(headerCellProps, {
              onResize: onResize,
              onColumnResizeEnd: _this2.handleColumnResizeEnd,
              onColumnResizeStart: _this2.handleColumnResizeStart,
              onColumnResizeMove: _this2.handleColumnResizeMove
            });
          }

          headerCells.push(React.cloneElement(columnChildren[0], _extends({}, cellProps, {}, headerCellProps)));
        }

        bodyCells.push(React.cloneElement(columnChildren[1], cellProps));
        left += nextWidth;
      }
    });
    return this._cacheCells = {
      headerCells: headerCells,
      bodyCells: bodyCells,
      allColumnsWidth: left,
      hasCustomTreeCol: hasCustomTreeCol
    };
  };

  _proto.initPosition = function initPosition() {
    var _this3 = this;

    if (this.isRTL()) {
      setTimeout(function () {
        var _this3$scrollbarXRef, _this3$scrollbarXRef$, _this3$scrollbarXRef$2;

        var _this3$state = _this3.state,
            contentWidth = _this3$state.contentWidth,
            width = _this3$state.width;
        _this3.scrollX = width - contentWidth - SCROLLBAR_WIDTH;

        _this3.updatePosition();

        (_this3$scrollbarXRef = _this3.scrollbarXRef) === null || _this3$scrollbarXRef === void 0 ? void 0 : (_this3$scrollbarXRef$ = _this3$scrollbarXRef.current) === null || _this3$scrollbarXRef$ === void 0 ? void 0 : (_this3$scrollbarXRef$2 = _this3$scrollbarXRef$.resetScrollBarPosition) === null || _this3$scrollbarXRef$2 === void 0 ? void 0 : _this3$scrollbarXRef$2.call(_this3$scrollbarXRef$, -_this3.scrollX);
      }, 0);
    }
  };

  _proto.updatePosition = function updatePosition() {
    var _this$tableHeaderRef;

    /**
     * 当存在锁定列情况处理
     */
    if (this.state.shouldFixedColumn) {
      this.updatePositionByFixedCell();
    } else {
      var _this$wheelWrapperRef, _this$headerWrapperRe2, _this$affixHeaderWrap, _affixHeaderElement$h;

      var wheelStyle = {};
      var headerStyle = {};
      this.translateDOMPositionXY(wheelStyle, this.scrollX, this.scrollY);
      this.translateDOMPositionXY(headerStyle, this.scrollX, 0);
      var wheelElement = (_this$wheelWrapperRef = this.wheelWrapperRef) === null || _this$wheelWrapperRef === void 0 ? void 0 : _this$wheelWrapperRef.current;
      var headerElement = (_this$headerWrapperRe2 = this.headerWrapperRef) === null || _this$headerWrapperRe2 === void 0 ? void 0 : _this$headerWrapperRe2.current;
      var affixHeaderElement = (_this$affixHeaderWrap = this.affixHeaderWrapperRef) === null || _this$affixHeaderWrap === void 0 ? void 0 : _this$affixHeaderWrap.current;
      wheelElement && addStyle(wheelElement, wheelStyle);
      headerElement && addStyle(headerElement, headerStyle);

      if (affixHeaderElement === null || affixHeaderElement === void 0 ? void 0 : (_affixHeaderElement$h = affixHeaderElement.hasChildNodes) === null || _affixHeaderElement$h === void 0 ? void 0 : _affixHeaderElement$h.call(affixHeaderElement)) {
        addStyle(affixHeaderElement.firstChild, headerStyle);
      }
    }

    if ((_this$tableHeaderRef = this.tableHeaderRef) === null || _this$tableHeaderRef === void 0 ? void 0 : _this$tableHeaderRef.current) {
      toggleClass(this.tableHeaderRef.current, this.addPrefix('cell-group-shadow'), this.scrollY < 0);
    }
  };

  _proto.updatePositionByFixedCell = function updatePositionByFixedCell() {
    var _this$wheelWrapperRef2;

    var wheelGroupStyle = {};
    var wheelStyle = {};
    var scrollGroups = this.getScrollCellGroups();
    var fixedLeftGroups = this.getFixedLeftCellGroups();
    var fixedRightGroups = this.getFixedRightCellGroups();
    var _this$state4 = this.state,
        contentWidth = _this$state4.contentWidth,
        width = _this$state4.width;
    this.translateDOMPositionXY(wheelGroupStyle, this.scrollX, 0);
    this.translateDOMPositionXY(wheelStyle, 0, this.scrollY);
    var scrollArrayGroups = Array.from(scrollGroups);

    for (var i = 0; i < scrollArrayGroups.length; i++) {
      var group = scrollArrayGroups[i];
      addStyle(group, wheelGroupStyle);
    }

    if ((_this$wheelWrapperRef2 = this.wheelWrapperRef) === null || _this$wheelWrapperRef2 === void 0 ? void 0 : _this$wheelWrapperRef2.current) {
      addStyle(this.wheelWrapperRef.current, wheelStyle);
    }

    var leftShadowClassName = this.addPrefix('cell-group-left-shadow');
    var rightShadowClassName = this.addPrefix('cell-group-right-shadow');
    var showLeftShadow = this.scrollX < 0;
    var showRightShadow = width - contentWidth - SCROLLBAR_WIDTH !== this.scrollX;
    toggleClass(fixedLeftGroups, leftShadowClassName, showLeftShadow);
    toggleClass(fixedRightGroups, rightShadowClassName, showRightShadow);
  };

  _proto.shouldRenderExpandedRow = function shouldRenderExpandedRow(rowData) {
    var _this$props19 = this.props,
        rowKey = _this$props19.rowKey,
        renderRowExpanded = _this$props19.renderRowExpanded,
        isTree = _this$props19.isTree;
    var expandedRowKeys = this.getExpandedRowKeys() || [];
    return isFunction(renderRowExpanded) && !isTree && expandedRowKeys.some(function (key) {
      return key === rowData[rowKey];
    });
  };

  _proto.calculateRowMaxHeight = function calculateRowMaxHeight() {
    var wordWrap = this.props.wordWrap;

    if (wordWrap) {
      var tableRowsMaxHeight = [];
      var tableRows = Object.values(this.tableRows);

      for (var i = 0; i < tableRows.length; i++) {
        var _tableRows$i = tableRows[i],
            row = _tableRows$i[0];

        if (row) {
          var cells = row.querySelectorAll("." + this.addPrefix('cell-wrap')) || [];
          var cellArray = Array.from(cells);
          var maxHeight = 0;

          for (var j = 0; j < cellArray.length; j++) {
            var cell = cellArray[j];
            var h = getHeight(cell);
            maxHeight = Math.max(maxHeight, h);
          }

          tableRowsMaxHeight.push(maxHeight);
        }
      }

      this.setState({
        tableRowsMaxHeight: tableRowsMaxHeight
      });
    }
  };

  _proto.calculateTableContentWidth = function calculateTableContentWidth(prevProps) {
    var _this$tableRef3;

    var table = (_this$tableRef3 = this.tableRef) === null || _this$tableRef3 === void 0 ? void 0 : _this$tableRef3.current;
    var row = table.querySelector("." + this.addPrefix('row') + ":not(.virtualized)");
    var contentWidth = row ? getWidth(row) : 0;
    this.setState({
      contentWidth: contentWidth
    }); // 这里 -SCROLLBAR_WIDTH 是为了让滚动条不挡住内容部分

    this.minScrollX = -(contentWidth - this.state.width) - SCROLLBAR_WIDTH;
    /**
     * 1.判断 Table 列数是否发生变化
     * 2.判断 Table 内容区域是否宽度有变化
     *
     * 满足 1 和 2 则更新横向滚动条位置
     */

    if (flatten(this.props.children).length !== flatten(prevProps.children).length && this.state.contentWidth !== contentWidth) {
      this.scrollLeft(0);
    }
  };

  _proto.calculateTableContextHeight = function calculateTableContextHeight(prevProps) {
    var table = this.tableRef.current;
    var rows = table.querySelectorAll("." + this.addPrefix('row')) || [];
    var _this$props20 = this.props,
        height = _this$props20.height,
        autoHeight = _this$props20.autoHeight,
        rowHeight = _this$props20.rowHeight;
    var headerHeight = this.getTableHeaderHeight();
    var contentHeight = rows.length ? Array.from(rows).map(function (row) {
      return getHeight(row) || rowHeight;
    }).reduce(function (x, y) {
      return x + y;
    }) : 0;
    var nextContentHeight = contentHeight - headerHeight;

    if (nextContentHeight !== this.state.contentHeight) {
      this.setState({
        contentHeight: nextContentHeight
      });
    }

    if (prevProps && ( // 当 data 更新，或者表格高度更新，则更新滚动条
    prevProps.height !== height || prevProps.data !== this.props.data) && this.scrollY !== 0) {
      this.scrollTop(Math.abs(this.scrollY));
      this.updatePosition();
    }

    if (!autoHeight) {
      // 这里 -SCROLLBAR_WIDTH 是为了让滚动条不挡住内容部分
      this.minScrollY = -(contentHeight - height) - SCROLLBAR_WIDTH;
    } // 如果内容区域的高度小于表格的高度，则重置 Y 坐标滚动条


    if (contentHeight < height) {
      this.scrollTop(0);
    } // 如果 scrollTop 的值大于可以滚动的范围 ，则重置 Y 坐标滚动条
    // 当 Table 为 virtualized 时， wheel 事件触发每次都会进入该逻辑， 避免在滚动到底部后滚动条重置, +SCROLLBAR_WIDTH


    if (Math.abs(this.scrollY) + height - headerHeight > nextContentHeight + SCROLLBAR_WIDTH) {
      this.scrollTop(this.scrollY);
    }
  };

  _proto.getControlledScrollTopValue = function getControlledScrollTopValue(value) {
    if (this.props.autoHeight) {
      return [0, 0];
    }

    var contentHeight = this.state.contentHeight;
    var headerHeight = this.getTableHeaderHeight();
    var height = this.getTableHeight(); // 滚动值的最大范围判断

    value = Math.min(value, Math.max(0, contentHeight - (height - headerHeight))); // value 值是表格理论滚动位置的一个值，通过 value 计算出 scrollY 坐标值与滚动条位置的值

    return [-value, value / contentHeight * (height - headerHeight)];
  };

  _proto.getControlledScrollLeftValue = function getControlledScrollLeftValue(value) {
    var _this$state5 = this.state,
        contentWidth = _this$state5.contentWidth,
        width = _this$state5.width; // 滚动值的最大范围判断

    value = Math.min(value, Math.max(0, contentWidth - width));
    return [-value, value / contentWidth * width];
  }
  /**
   * public method
   */
  ;

  _proto.renderRowData = function renderRowData(bodyCells, rowData, props, shouldRenderExpandedRow) {
    var _this$props21 = this.props,
        renderTreeToggle = _this$props21.renderTreeToggle,
        rowKey = _this$props21.rowKey,
        wordWrap = _this$props21.wordWrap,
        isTree = _this$props21.isTree;
    var hasChildren = isTree && rowData.children && Array.isArray(rowData.children);
    var nextRowKey = typeof rowData[rowKey] !== 'undefined' ? rowData[rowKey] : props.key;

    var rowProps = _extends({}, props, {
      rowRef: this.bindTableRowsRef(props.key, rowData),
      onClick: this.bindRowClick(rowData),
      onDoubleClick: this.bindRowDoubleClick(rowData),
      onContextMenu: this.bindRowContextMenu(rowData)
    });

    var expandedRowKeys = this.getExpandedRowKeys() || [];
    var expanded = expandedRowKeys.some(function (key) {
      return key === rowData[rowKey];
    });
    var cells = [];

    for (var i = 0; i < bodyCells.length; i++) {
      var cell = bodyCells[i];
      cells.push(React.cloneElement(cell, {
        hasChildren: hasChildren,
        rowData: rowData,
        wordWrap: wordWrap,
        renderTreeToggle: renderTreeToggle,
        height: props.height,
        rowIndex: props.key,
        depth: props.depth,
        onTreeToggle: this.handleTreeToggle,
        rowKey: nextRowKey,
        expanded: expanded
      }));
    }

    return this.renderRow(rowProps, cells, shouldRenderExpandedRow, rowData);
  };

  _proto.renderRow = function renderRow(props, cells, shouldRenderExpandedRow, rowData) {
    var rowClassName = this.props.rowClassName;
    var _this$state6 = this.state,
        shouldFixedColumn = _this$state6.shouldFixedColumn,
        width = _this$state6.width,
        contentWidth = _this$state6.contentWidth;

    if (typeof rowClassName === 'function') {
      props.className = rowClassName(rowData);
    } else {
      props.className = rowClassName;
    }

    var rowStyles = {};
    var rowRight = 0;

    if (this.isRTL() && contentWidth > width) {
      rowRight = width - contentWidth;
      rowStyles.right = rowRight;
    } // IF there are fixed columns, add a fixed group


    if (shouldFixedColumn && contentWidth > width) {
      var fixedLeftCells = [];
      var fixedRightCells = [];
      var scrollCells = [];
      var fixedLeftCellGroupWidth = 0;
      var fixedRightCellGroupWidth = 0;

      for (var i = 0; i < cells.length; i++) {
        var cell = cells[i];
        var _cell$props = cell.props,
            fixed = _cell$props.fixed,
            _width2 = _cell$props.width;
        var isFixedStart = fixed === 'left' || fixed === true;
        var isFixedEnd = fixed === 'right';

        if (this.isRTL()) {
          isFixedStart = fixed === 'right';
          isFixedEnd = fixed === 'left' || fixed === true;
        }

        if (isFixedStart) {
          fixedLeftCells.push(cell);
          fixedLeftCellGroupWidth += _width2;
        } else if (isFixedEnd) {
          fixedRightCells.push(cell);
          fixedRightCellGroupWidth += _width2;
        } else {
          scrollCells.push(cell);
        }
      }

      return React.createElement(Row, _extends({}, props, {
        style: rowStyles
      }), fixedLeftCellGroupWidth ? React.createElement(CellGroup, {
        fixed: "left",
        height: props.isHeaderRow ? props.headerHeight : props.height,
        width: fixedLeftCellGroupWidth,
        style: this.isRTL() ? {
          right: width - fixedLeftCellGroupWidth - rowRight
        } : null
      }, mergeCells(resetLeftForCells(fixedLeftCells))) : null, React.createElement(CellGroup, null, mergeCells(scrollCells)), fixedRightCellGroupWidth ? React.createElement(CellGroup, {
        fixed: "right",
        style: this.isRTL() ? {
          right: 0 - rowRight - SCROLLBAR_WIDTH
        } : {
          left: width - fixedRightCellGroupWidth - SCROLLBAR_WIDTH
        },
        height: props.isHeaderRow ? props.headerHeight : props.height,
        width: fixedRightCellGroupWidth
      }, mergeCells(resetLeftForCells(fixedRightCells))) : null, shouldRenderExpandedRow && this.renderRowExpanded(rowData));
    }

    return React.createElement(Row, _extends({}, props, {
      style: rowStyles
    }), React.createElement(CellGroup, null, mergeCells(cells)), shouldRenderExpandedRow && this.renderRowExpanded(rowData));
  };

  _proto.renderRowExpanded = function renderRowExpanded(rowData) {
    var _this$props22 = this.props,
        renderRowExpanded = _this$props22.renderRowExpanded,
        rowExpandedHeight = _this$props22.rowExpandedHeight;
    var styles = {
      height: rowExpandedHeight
    };

    if (typeof renderRowExpanded === 'function') {
      return React.createElement("div", {
        className: this.addPrefix('row-expanded'),
        style: styles
      }, renderRowExpanded(rowData));
    }

    return null;
  };

  _proto.renderMouseArea = function renderMouseArea() {
    var headerHeight = this.getTableHeaderHeight();
    var styles = {
      height: this.getTableHeight()
    };
    var spanStyles = {
      height: headerHeight - 1
    };
    return React.createElement("div", {
      ref: this.mouseAreaRef,
      className: this.addPrefix('mouse-area'),
      style: styles
    }, React.createElement("span", {
      style: spanStyles
    }));
  };

  _proto.renderTableHeader = function renderTableHeader(headerCells, rowWidth) {
    var affixHeader = this.props.affixHeader;
    var tableWidth = this.state.width;
    var top = typeof affixHeader === 'number' ? affixHeader : 0;
    var headerHeight = this.getTableHeaderHeight();
    var rowProps = {
      rowRef: this.tableHeaderRef,
      width: rowWidth,
      height: this.getRowHeight(),
      headerHeight: headerHeight,
      isHeaderRow: true,
      top: 0
    };
    var fixedStyle = {
      position: 'fixed',
      overflow: 'hidden',
      height: this.getTableHeaderHeight(),
      width: tableWidth,
      top: top
    }; // Affix header

    var header = React.createElement("div", {
      className: classNames(this.addPrefix('affix-header')),
      style: fixedStyle,
      ref: this.affixHeaderWrapperRef
    }, this.renderRow(rowProps, headerCells));
    return React.createElement(React.Fragment, null, (affixHeader === 0 || affixHeader) && header, React.createElement("div", {
      className: this.addPrefix('header-row-wrapper'),
      ref: this.headerWrapperRef
    }, this.renderRow(rowProps, headerCells)));
  };

  _proto.renderTableBody = function renderTableBody(bodyCells, rowWidth) {
    var _this$props23 = this.props,
        rowExpandedHeight = _this$props23.rowExpandedHeight,
        renderRowExpanded = _this$props23.renderRowExpanded,
        isTree = _this$props23.isTree,
        rowKey = _this$props23.rowKey,
        wordWrap = _this$props23.wordWrap,
        virtualized = _this$props23.virtualized,
        rowHeight = _this$props23.rowHeight;
    var headerHeight = this.getTableHeaderHeight();
    var _this$state7 = this.state,
        tableRowsMaxHeight = _this$state7.tableRowsMaxHeight,
        isScrolling = _this$state7.isScrolling,
        data = _this$state7.data;
    var height = this.getTableHeight();
    var bodyHeight = height - headerHeight;
    var bodyStyles = {
      top: headerHeight,
      height: bodyHeight
    };
    var contentHeight = 0;
    var topHideHeight = 0;
    var bottomHideHeight = 0;
    this._visibleRows = [];

    if (data) {
      var top = 0; // Row position

      var minTop = Math.abs(this.scrollY);
      var maxTop = minTop + height + rowExpandedHeight;
      var isCustomRowHeight = typeof rowHeight === 'function';
      var isUncertainHeight = !!(renderRowExpanded || isCustomRowHeight || isTree);
      /**
      如果开启了 virtualized  同时 Table 中的的行高是可变的，
      则需要循环遍历 data, 获取每一行的高度。
      */

      if (isUncertainHeight && virtualized || !virtualized) {
        for (var index = 0; index < data.length; index++) {
          var rowData = data[index];
          var maxHeight = tableRowsMaxHeight[index];
          var shouldRenderExpandedRow = this.shouldRenderExpandedRow(rowData);
          var nextRowHeight = 0;
          var depth = 0;

          if (typeof rowHeight === 'function') {
            nextRowHeight = rowHeight(rowData);
          } else {
            nextRowHeight = maxHeight ? Math.max(maxHeight + CELL_PADDING_HEIGHT, rowHeight) : rowHeight;

            if (shouldRenderExpandedRow) {
              nextRowHeight += rowExpandedHeight;
            }
          }

          if (isTree) {
            var parents = findAllParents(rowData, rowKey);
            var expandedRowKeys = this.getExpandedRowKeys();
            depth = parents.length; // 树节点如果被关闭，则不渲染

            if (!shouldShowRowByExpanded(expandedRowKeys, parents)) {
              continue;
            }
          }

          contentHeight += nextRowHeight;
          var rowProps = {
            key: index,
            top: top,
            width: rowWidth,
            depth: depth,
            height: nextRowHeight
          };
          top += nextRowHeight;

          if (virtualized && !wordWrap) {
            if (top + nextRowHeight < minTop) {
              topHideHeight += nextRowHeight;
              continue;
            } else if (top > maxTop) {
              bottomHideHeight += nextRowHeight;
              continue;
            }
          }

          this._visibleRows.push(this.renderRowData(bodyCells, rowData, rowProps, shouldRenderExpandedRow));
        }
      } else {
        /**
        如果 Table 的行高是固定的，则直接通过行高与行数进行计算，
        减少遍历所有 data 带来的性能消耗
        */
        var _nextRowHeight = this.getRowHeight();

        var startIndex = Math.max(Math.floor(minTop / _nextRowHeight), 0);
        var endIndex = Math.min(startIndex + Math.ceil(bodyHeight / _nextRowHeight), data.length);
        contentHeight = data.length * _nextRowHeight;
        topHideHeight = startIndex * _nextRowHeight;
        bottomHideHeight = (data.length - endIndex) * _nextRowHeight;

        for (var _index = startIndex; _index < endIndex; _index++) {
          var _rowData = data[_index];
          var _rowProps = {
            key: _index,
            top: _index * _nextRowHeight,
            width: rowWidth,
            height: _nextRowHeight
          };

          this._visibleRows.push(this.renderRowData(bodyCells, _rowData, _rowProps, false));
        }
      }
    }

    var wheelStyles = {
      position: 'absolute',
      height: contentHeight,
      minHeight: height,
      pointerEvents: isScrolling ? 'none' : undefined
    };
    var topRowStyles = {
      height: topHideHeight
    };
    var bottomRowStyles = {
      height: bottomHideHeight
    };
    return React.createElement("div", {
      ref: this.tableBodyRef,
      className: this.addPrefix('body-row-wrapper'),
      style: bodyStyles,
      onScroll: this.handleBodyScroll
    }, React.createElement("div", {
      style: wheelStyles,
      className: this.addPrefix('body-wheel-area'),
      ref: this.wheelWrapperRef
    }, topHideHeight ? React.createElement(Row, {
      style: topRowStyles,
      className: "virtualized"
    }) : null, this._visibleRows, bottomHideHeight ? React.createElement(Row, {
      style: bottomRowStyles,
      className: "virtualized"
    }) : null), this.renderInfo(), this.renderScrollbar(), this.renderLoading());
  };

  _proto.renderInfo = function renderInfo() {
    var _this$props24 = this.props,
        locale = _this$props24.locale,
        renderEmpty = _this$props24.renderEmpty,
        loading = _this$props24.loading;

    if (this._visibleRows.length || loading) {
      return null;
    }

    var emptyMessage = React.createElement("div", {
      className: this.addPrefix('body-info')
    }, locale.emptyMessage);
    return renderEmpty ? renderEmpty(emptyMessage) : emptyMessage;
  };

  _proto.renderScrollbar = function renderScrollbar() {
    var _this$props25 = this.props,
        disabledScroll = _this$props25.disabledScroll,
        affixHorizontalScrollbar = _this$props25.affixHorizontalScrollbar;
    var _this$state8 = this.state,
        contentWidth = _this$state8.contentWidth,
        contentHeight = _this$state8.contentHeight,
        width = _this$state8.width,
        fixedHorizontalScrollbar = _this$state8.fixedHorizontalScrollbar;
    var bottom = typeof affixHorizontalScrollbar === 'number' ? affixHorizontalScrollbar : 0;
    var headerHeight = this.getTableHeaderHeight();
    var height = this.getTableHeight();

    if (disabledScroll) {
      return null;
    }

    return React.createElement("div", null, React.createElement(Scrollbar, {
      className: classNames({
        fixed: fixedHorizontalScrollbar
      }),
      style: {
        width: width,
        bottom: fixedHorizontalScrollbar ? bottom : undefined
      },
      length: this.state.width,
      onScroll: this.handleScrollX,
      scrollLength: contentWidth,
      ref: this.scrollbarXRef
    }), React.createElement(Scrollbar, {
      vertical: true,
      length: height - headerHeight,
      scrollLength: contentHeight,
      onScroll: this.handleScrollY,
      ref: this.scrollbarYRef
    }));
  }
  /**
   *  show loading
   */
  ;

  _proto.renderLoading = function renderLoading() {
    var _this$props26 = this.props,
        locale = _this$props26.locale,
        loading = _this$props26.loading,
        loadAnimation = _this$props26.loadAnimation,
        renderLoading = _this$props26.renderLoading;

    if (!loadAnimation && !loading) {
      return null;
    }

    var loadingElement = React.createElement("div", {
      className: this.addPrefix('loader-wrapper')
    }, React.createElement("div", {
      className: this.addPrefix('loader')
    }, React.createElement("i", {
      className: this.addPrefix('loader-icon')
    }), React.createElement("span", {
      className: this.addPrefix('loader-text')
    }, locale.loading)));
    return renderLoading ? renderLoading(loadingElement) : loadingElement;
  };

  _proto.render = function render() {
    var _classNames;

    var _this$props27 = this.props,
        children = _this$props27.children,
        className = _this$props27.className,
        _this$props27$width = _this$props27.width,
        width = _this$props27$width === void 0 ? 0 : _this$props27$width,
        style = _this$props27.style,
        isTree = _this$props27.isTree,
        hover = _this$props27.hover,
        bordered = _this$props27.bordered,
        cellBordered = _this$props27.cellBordered,
        wordWrap = _this$props27.wordWrap,
        classPrefix = _this$props27.classPrefix,
        loading = _this$props27.loading,
        showHeader = _this$props27.showHeader,
        rest = _objectWithoutPropertiesLoose(_this$props27, ["children", "className", "width", "style", "isTree", "hover", "bordered", "cellBordered", "wordWrap", "classPrefix", "loading", "showHeader"]);

    var isColumnResizing = this.state.isColumnResizing;

    var _this$getCellDescript = this.getCellDescriptor(),
        headerCells = _this$getCellDescript.headerCells,
        bodyCells = _this$getCellDescript.bodyCells,
        allColumnsWidth = _this$getCellDescript.allColumnsWidth,
        hasCustomTreeCol = _this$getCellDescript.hasCustomTreeCol;

    var rowWidth = allColumnsWidth > width ? allColumnsWidth : width;
    var clesses = classNames(classPrefix, className, (_classNames = {}, _classNames[this.addPrefix('word-wrap')] = wordWrap, _classNames[this.addPrefix('treetable')] = isTree, _classNames[this.addPrefix('bordered')] = bordered, _classNames[this.addPrefix('cell-bordered')] = cellBordered, _classNames[this.addPrefix('column-resizing')] = isColumnResizing, _classNames[this.addPrefix('hover')] = hover, _classNames[this.addPrefix('loading')] = loading, _classNames));

    var styles = _extends({
      width: width || 'auto',
      height: this.getTableHeight()
    }, style);

    var unhandled = getUnhandledProps(Table, rest);
    return React.createElement(TableContext.Provider, {
      value: {
        translateDOMPositionXY: this.translateDOMPositionXY,
        rtl: this.isRTL(),
        hasCustomTreeCol: hasCustomTreeCol
      }
    }, React.createElement("div", _extends({}, unhandled, {
      className: clesses,
      style: styles,
      ref: this.tableRef
    }), showHeader && this.renderTableHeader(headerCells, rowWidth), children && this.renderTableBody(bodyCells, rowWidth), showHeader && this.renderMouseArea()));
  };

  return Table;
}(React.Component);

Table.propTypes = {
  width: PropTypes.number,
  data: PropTypes.arrayOf(PropTypes.object),
  height: PropTypes.number,
  autoHeight: PropTypes.bool,
  minHeight: PropTypes.number,
  rowHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
  headerHeight: PropTypes.number,
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isTree: PropTypes.bool,
  defaultExpandAllRows: PropTypes.bool,
  defaultExpandedRowKeys: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  expandedRowKeys: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  renderTreeToggle: PropTypes.func,
  renderRowExpanded: PropTypes.func,
  rowExpandedHeight: PropTypes.number,
  locale: PropTypes.object,
  style: PropTypes.object,
  sortColumn: PropTypes.string,
  sortType: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  defaultSortType: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  disabledScroll: PropTypes.bool,
  hover: PropTypes.bool,
  loading: PropTypes.bool,
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  children: PropTypes.any,
  bordered: PropTypes.bool,
  cellBordered: PropTypes.bool,
  wordWrap: PropTypes.bool,
  onRowClick: PropTypes.func,
  onRowDoubleClick: PropTypes.func,
  onRowContextMenu: PropTypes.func,
  onScroll: PropTypes.func,
  onSortColumn: PropTypes.func,
  onExpandChange: PropTypes.func,
  onTouchStart: PropTypes.func,
  onTouchMove: PropTypes.func,
  bodyRef: PropTypes.func,
  loadAnimation: PropTypes.bool,
  showHeader: PropTypes.bool,
  rowClassName: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  virtualized: PropTypes.bool,
  renderEmpty: PropTypes.func,
  renderLoading: PropTypes.func,
  translate3d: PropTypes.bool,
  affixHeader: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  affixHorizontalScrollbar: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  rtl: PropTypes.bool,
  onDataUpdated: PropTypes.func,
  shouldUpdateScroll: PropTypes.bool
};
Table.defaultProps = {
  classPrefix: defaultClassPrefix('table'),
  data: [],
  defaultSortType: SORT_TYPE.DESC,
  height: 200,
  rowHeight: 46,
  headerHeight: 40,
  minHeight: 0,
  rowExpandedHeight: 100,
  hover: true,
  showHeader: true,
  rowKey: 'key',
  translate3d: true,
  shouldUpdateScroll: true,
  locale: {
    emptyMessage: 'No data found',
    loading: 'Loading...'
  }
};
export default Table;