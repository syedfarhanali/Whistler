
define('foreground/application',[],function () {
    'use strict';

    var Application = Backbone.Marionette.Application.extend({
        backgroundPage: null,

        //  Configure qTip2's default behavior.
        _configureQtip: function () {
            this._setQtipPositioning();
            this._setQtipStyle();
        },
        
        _setBackgroundPage: function () {
            this.backgroundPage = chrome.extension.getBackgroundPage();
        },
        
        _setQtipPositioning: function () {
            $.extend($.fn.qtip.defaults.position, {
                viewport: $(window),
                my: 'top center',
                at: 'bottom center',
                hide: {
                    leave: false
                }
            });
        },
        
        _setQtipStyle: function() {
            $.extend($.fn.qtip.defaults.style, {
                classes: 'qtip-light qtip-shadow'
            });
        },
        
        _showForeground: function() {
            //  Fire up the foreground:
            require(['foreground/view/foregroundView']);
        }
    });

    var streamus = new Application();
    
    streamus.addInitializer(function () {
        this._configureQtip();
        this._setBackgroundPage();
        this.on('start', this._showForeground);
    });
    
    streamus.start();

    window.Streamus = streamus;
});
define('foreground/model/contextMenuItem',[],function () {
    'use strict';

    var ContextMenuItem = Backbone.Model.extend({
        defaults:  {
            text: '',
            disabled: false,
            title: '',
            onMouseDown: null
        }
    });

    return ContextMenuItem;
});
define('foreground/collection/contextMenuItems',[
    'foreground/model/contextMenuItem'
], function (ContextMenuItem) {
    'use strict';

    var ContextMenuItems = Backbone.Collection.extend({
        model: ContextMenuItem
    });

    return new ContextMenuItems();
});
define('foreground/model/contextMenu',[],function() {
    'use strict';

    var ContextMenu = Backbone.Model.extend({
        defaults: {
            top: 0,
            left: 0
        }
    });

    return ContextMenu;
});
//  This behavior decorates a view with a qTip2 Tooltip. It will apply a tooltip to the view's root element
//  if it has a title. It will also apply tooltips to child elements if they have the tooltipable or
//  text-tooltipale class. The text-tooltipable class assumes that the element's text is to be conditionally
//  shown as a tooltip. The text tooltip will only be shown if the text is overflows the element.
define('foreground/view/behavior/tooltip',[],function () {
    'use strict';

    var Tooltip = Backbone.Marionette.Behavior.extend({
        ui: {
            //  Children which need tooltips are decorated with the tooltipable class.
            tooltipable: '.tooltipable',
            //  Children which need tooltips, but also need to take into account overflowing, are decorated with the text-tooltipable class.
            textTooltipable: '.text-tooltipable'
        },
        
        initialize: function () {
            //  Give Tooltip an array property of titleMutationObservers: https://github.com/jashkenas/backbone/issues/1442
            //  Mutation observers are used to track changes to text-tooltipable elements. If the text
            //  is modified then its overflowing state needs to be re-evaluated. 
            _.extend(this, {
                 titleMutationObservers: []
            });
        },
        
        onShow: function () {
            this._setTooltips();
        },
        
        onDestroy: function () {
            _.each(this.titleMutationObservers, function (titleMutationObserver) {
                titleMutationObserver.disconnect();
            });
            this.titleMutationObservers.length = 0;

            this._destroy(this.$el);
            this._destroy(this.ui.tooltipable);
            this._destroy(this.ui.textTooltipable);
        },
        
        _setTooltips: function () {
            //  Decorate the view itself
            var isTextTooltipableElement = this._isTextTooltipableElement(this.$el);

            if (isTextTooltipableElement) {
                this._decorateTextTooltipable(this.$el);
            } else {
                this.$el.qtip();
            }

            //  Decorate child views
            this.ui.tooltipable.qtip();
            if (this.ui.textTooltipable.length > 0) {
                this._decorateTextTooltipable(this.ui.textTooltipable);
            }
        },
        
        _decorateTextTooltipable: function(textTooltipableElement) {
            this._setTitleTooltip(textTooltipableElement);
            this._setTitleMutationObserver(textTooltipableElement);
        },
        
        //  Elements decorated with the class 'text-tooltipable' should display a tooltip if their text is overflowing and truncated.
        _isTextTooltipableElement: function(element) {
            return element.hasClass('text-tooltipable');
        },
        
        //  Whenever an element's title changes -- need to re-check to see if it is overflowing and apply/remove the tooltip accordingly.
        _setTitleMutationObserver: function (element) {
            var titleMutationObserver = new window.MutationObserver(function (mutations) {
                mutations.forEach(function() {
                    this._setTitleTooltip(element);
                }.bind(this));
            }.bind(this));

            titleMutationObserver.observe(element[0], {
                attributes: true,
                //  Once qtip has been applied to the element -- oldtitle will mutate instead of title
                attributeFilter: ['title', 'oldtitle'],
                subtree: false
            });

            this.titleMutationObservers.push(titleMutationObserver);
        },
        
        _setTitleTooltip: function (element) {
            //  Only show the tooltip if the title is overflowing.
            var textOverflows = element[0].offsetWidth < element[0].scrollWidth;

            if (textOverflows) {
                element.qtip();
            } else {
                //  It's important to only set the title to string.empty if it's not already string.empty because MutationObserver will infinite loop otherwise.
                if (element.attr('title') !== '') {
                    //  Clear the title so that it doesn't show using the native tooltip.
                    element.attr('title', '');
                }
                
                //  If tooltip has already been applied to the element - remove it.
                this._destroy(element);
            }
        },
        
        //  Unbind qTip to allow the GC to clean-up everything.
        //  Memory leak will happen if this is not called.
        _destroy: function (element) {
            element.qtip('destroy', true);
        }
    });

    return Tooltip;
});
define('text',{load: function(id){throw new Error("Dynamic load not allowed: " + id);}});
define('text!template/contextMenuItem.html',[],function () { return '<%= text %>';});

define('foreground/view/contextMenuItemView',[
    'foreground/view/behavior/tooltip',
    'text!template/contextMenuItem.html'
], function (Tooltip, ContextMenuItemTemplate) {
    'use strict';

    var ContextMenuItemView = Backbone.Marionette.ItemView.extend({
        tagName: 'li',
        className: 'clickable',
        template: _.template(ContextMenuItemTemplate),

        events: {
            'click': '_onClick',
        },

        attributes: function () {
            return {
                title: this.model.get('title')
            };
        },
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },

        onRender: function () {
            this._setState();
        },

        _setState: function () {
            this.$el.toggleClass('disabled', this.model.get('disabled'));
        },

        _onClick: function () {
            if (this.$el.hasClass('disabled')) {
                return false;
            }

            this.model.get('onClick')();
        }
    });

    return ContextMenuItemView;
});
define('foreground/view/contextMenuView',[
    'foreground/view/contextMenuItemView'
], function (ContextMenuItemView) {
    'use strict';

    var ContextMenuView = Backbone.Marionette.CompositeView.extend({
        id: 'context-menu',
        tagName: 'ul',
        className: 'menu',
        childView: ContextMenuItemView,
        template: _.template(),
        //  Used to determine whether context-menu display should flip as to not overflow container
        containerHeight: 0,
        containerWidth: 0,
        
        initialize: function(options) {
            this.containerHeight = options.containerHeight;
            this.containerWidth = options.containerWidth;
        },

        onShow: function () {
            var offsetTop = this._ensureOffset(this.model.get('top'), this.$el.height(), this.containerHeight);
            var offsetLeft = this._ensureOffset(this.model.get('left'), this.$el.width(), this.containerWidth);

            this.$el.offset({
                top: offsetTop,
                left: offsetLeft
            });
        },
        
        //  Prevent displaying ContextMenu outside of viewport by ensuring its offsets are valid.
        _ensureOffset: function(offset, elementDimension, containerDimension) {
            var ensuredOffset = offset;
            var needsFlip = offset + elementDimension > containerDimension;
            
            if (needsFlip) {
                ensuredOffset -= elementDimension;
            }

            return ensuredOffset;
        }
    });

    return ContextMenuView;
});
define('foreground/view/contextMenuRegion',[
    'foreground/collection/contextMenuItems',
    'foreground/model/contextMenu',
    'foreground/view/contextMenuView'
], function (ContextMenuItems, ContextMenu, ContextMenuView) {
    'use strict';

    var ContextMenuRegion = Backbone.Marionette.Region.extend({
        //  TODO: I am required to use ID selector here until bug resolved: https://github.com/marionettejs/backbone.marionette/issues/1530
        el: '#context-menu-region',
        containerHeight: 0,
        containerWidth: 0,
        
        initialize: function (options) {
            this.containerHeight = options && options.containerHeight ? options.containerHeight : this.containerHeight;
            this.containerWidth = options && options.containerWidth ? options.containerWidth : this.containerWidth;

            if (this.containerHeight <= 0 || this.containerWidth <= 0) throw new Error('ContextMenuRegion expects containerHeight and containerWidth to be set');
        },
        
        //  If a click occurs and the default isn't prevented, reset the context menu groups to hide it.
        //  Child elements will call event.preventDefault() to indicate that they have handled the context menu.
        handleClickEvent: function (event) {
            event.isDefaultPrevented() ? this._showContextMenu() : this._hideContextMenu();
        },
        
        _showContextMenu: function() {
            this.show(new ContextMenuView({
                collection: ContextMenuItems,
                model: new ContextMenu({
                    top: event.pageY,
                    //  Show the element just slightly offset as to not break onHover effects.
                    left: event.pageX + 1
                }),
                containerHeight: this.containerHeight,
                containerWidth: this.containerWidth
            }));
        },
        
        _hideContextMenu: function() {
            ContextMenuItems.reset();
            this.empty();
        }
    });

    return ContextMenuRegion;
});
define('common/enum/listItemType',{
    None: 'none',
    PlaylistItem: 'playlistItem',
    StreamItem: 'streamItem',
    SearchResult: 'searchResult',
    Playlist: 'playlist'
});
define('foreground/view/behavior/multiSelect',[
    'common/enum/listItemType'
], function (ListItemType) {
    'use strict';

    var MultiSelect = Backbone.Marionette.Behavior.extend({
        ui: {
            listItem: '.list-item'
        },

        events: {
            'click @ui.listItem': '_onItemClicked',
        },
        
        initialize: function() {
            this.listenTo(Backbone.Wreqr.radio.channel('global').vent, 'clickedElement', this._onClickedElement);
        },
        
        //  Whenever an item is dragged - ensure it is selected because click event doesn't happen
        //  when performing a drag operation. It doesn't feel right to use mousedown instead of click.
        onItemDragged: function (item) {
            this._setSelected({
                modelToSelect: item,
                drag: true
            });
        },
        
        onDestroy: function() {
            //  Forget selected items when the view is destroyed.
            this._deselectCollection();
        },
        
        _deselectCollection: function () {
            this.view.collection.deselectAll();
        },
        
        _onClickedElement: function (clickedElement) {
            var clickedItem = clickedElement.closest('.multi-select-item');
            var listItemType = clickedItem.length > 0 ? clickedItem.data('type') : ListItemType.None;

            if (listItemType !== this.view.childViewOptions.type) {
                this._deselectCollection();
            }
        },
        
        _onItemClicked: function (event) {
            var id = $(event.currentTarget).data('id');
            var modelToSelect = this.view.collection.get(id);

            this._setSelected({
                shiftKey: event.shiftKey,
                ctrlKey: event.ctrlKey,
                modelToSelect: modelToSelect
            });
        },
        
        _setSelected: function (options) {
            var modelToSelect = options.modelToSelect;

            var shiftKeyPressed = options.shiftKey || false;
            var ctrlKeyPressed = options.ctrlKey || false;
            var isDrag = options.drag || false;

            var isSelectedAlready = modelToSelect.get('selected');
            //  When holding the ctrl key and clicking an already selected item -- the item becomes deselected.
            modelToSelect.set('selected', (ctrlKeyPressed && isSelectedAlready) ? false : true);

            //  When the shift key is pressed - select a block of search result items
            if (shiftKeyPressed) {
                var selectedIndex = this.view.collection.indexOf(modelToSelect);
                this._selectGroup(selectedIndex);
            } else if (ctrlKeyPressed) {
                //  Using the ctrl key to select an item resets firstSelect (which is a special scenario)
                //  but doesn't lose the other selected items.
                modelToSelect.set('firstSelected', true);
            } else if (!(isDrag && isSelectedAlready)) {
                //  All other selections are lost unless dragging a group of items.
                this.view.collection.deselectAllExcept(modelToSelect);
            }
        },
        
        _selectGroup: function (selectedIndex) {
            var firstSelectedIndex = 0;
            var collection = this.view.collection;

            //  If the first item is being selected with shift held -- firstSelectedIndex isn't used and selection goes from the top.
            if (collection.selected().length > 1) {
                var firstSelected = collection.firstSelected();

                //  Get the search result which was selected first and go from its index.
                firstSelectedIndex = collection.indexOf(firstSelected);
            }

            //  Select all items between the selected item and the firstSelected item.
            collection.each(function (model, index) {
                var isBetweenAbove = index <= selectedIndex && index >= firstSelectedIndex;
                var isBetweenBelow = index >= selectedIndex && index <= firstSelectedIndex;

                model.set('selected', isBetweenBelow || isBetweenAbove);
            });

            //  Holding the shift key is a bit of a special case. User expects the first item highlighted to be the 'firstSelected' and not the clicked.
            collection.at(firstSelectedIndex).set('firstSelected', true);
        }
    });

    return MultiSelect;
});
define('foreground/view/behavior/slidingRender',[],function () {
    'use strict';

    var SlidingRender = Backbone.Marionette.Behavior.extend({
        collectionEvents: {
            'reset': '_onCollectionReset',
            'remove': '_onCollectionRemove',
            'add': '_onCollectionAdd',
            'change:active': '_onCollectionChangeActive'
        },
        
        ui: {
            list: '.list'
        },
        
        //  Enables progressive rendering of children by keeping track of indices which are currently rendered.
        minRenderIndex: -1,
        maxRenderIndex: -1,

        //  The height of a rendered childView in px. Including padding/margin.
        childViewHeight: 40,
        viewportHeight: -1,
        
        //  The number of items to render outside of the viewport. Helps with flickering because if
        //  only views which would be visible are rendered then they'd be visible while loading.
        threshold: 10,

        //  Keep track of where user is scrolling from to determine direction and amount changed.
        lastScrollTop: 0,
        
        initialize: function () {
            //  IMPORTANT: Stub out the view's implementation of addChild with the slidingRender version.
            this.view.addChild = this._addChild.bind(this);
        },
        
        onShow: function () {
            //  Allow N items to be rendered initially where N is how many items need to cover the viewport.
            this.minRenderIndex = this._getMinRenderIndex(0);
            this._setViewportHeight();

            //  If the collection implements getActiveItem - scroll to the active item.
            if (this.view.collection.getActiveItem) {
                if (this.view.collection.length > 0) {
                    this._scrollToItem(this.view.collection.getActiveItem());
                }
            }

            var self = this;
            //  Throttle the scroll event because scrolls can happen a lot and don't need to re-calculate very often.
            this.ui.list.scroll(_.throttle(function () {
                self._setRenderedElements(this.scrollTop);
            }, 20));
        },
        
        //  jQuery UI's sortable needs to be able to know the minimum rendered index. Whenever an external
        //  event requests the min render index -- return it!
        onGetMinRenderIndex: function () {
            this.view.triggerMethod('GetMinRenderIndexReponse', {
                minRenderIndex: this.minRenderIndex
            });
        },
        
        onListHeightUpdated: function () {
            this._setViewportHeight();
        },
        
        //  Whenever the viewport height is changed -- adjust the items which are currently rendered to match
        _setViewportHeight: function () {
            this.viewportHeight = this.ui.list.height();

            //  Unload or load N items where N is the difference in viewport height.
            var currentMaxRenderIndex = this.maxRenderIndex;

            var newMaxRenderIndex = this._getMaxRenderIndex(this.lastScrollTop);
            var indexDifference = currentMaxRenderIndex - newMaxRenderIndex;
            
            //  Be sure to update before potentially adding items or else they won't render.
            this.maxRenderIndex = newMaxRenderIndex;
            if (indexDifference > 0) {
                //  Unload N Items.
                //  Only remove items if need be -- collection's length might be so small that the viewport's height isn't affecting rendered count.
                if (this.view.collection.length > currentMaxRenderIndex) {
                    this._removeItemsByIndex(currentMaxRenderIndex, indexDifference);
                }
            }
            else if (indexDifference < 0) {
                //  Load N items
                for (var count = 0; count < Math.abs(indexDifference) ; count++) {
                    this._renderElementAtIndex(currentMaxRenderIndex + 1 + count);
                }
            }
            
            this._setHeightPaddingTop();
        },

        //  When deleting an element from a list it's important to render the next element (if any) since
        //  usually this only happens during scroll, but positions change when removing.
        _renderElementAtIndex: function (index) {
            var rendered = false;

            if (this.view.collection.length > index) {
                var item = this.view.collection.at(index);
                var ChildView = this.view.getChildView(item);

                //  Adjust the childView's index to account for where it is actually being added in the list
                this._addChild(item, ChildView, index);
                rendered = true;
            }

            return rendered;
        },

        _setRenderedElements: function (scrollTop) {
            //  Figure out the range of items currently rendered:
            var currentMinRenderIndex = this.minRenderIndex;
            var currentMaxRenderIndex = this.maxRenderIndex;

            //  Figure out the range of items which need to be rendered:
            var minRenderIndex = this._getMinRenderIndex(scrollTop);
            var maxRenderIndex = this._getMaxRenderIndex(scrollTop);

            var itemsToAdd = [];
            var itemsToRemove = [];

            //  Append items in the direction being scrolled and remove items being scrolled away from.
            var direction = scrollTop > this.lastScrollTop ? 'down' : 'up';

            if (direction === 'down') {
                //  Need to remove items which are less than the new minRenderIndex
                if (minRenderIndex > currentMinRenderIndex) {
                    itemsToRemove = this.view.collection.slice(currentMinRenderIndex, minRenderIndex);
                }

                //  Need to add items which are greater than oldMaxRenderIndex and ltoe maxRenderIndex
                if (maxRenderIndex > currentMaxRenderIndex) {
                    itemsToAdd = this.view.collection.slice(currentMaxRenderIndex + 1, maxRenderIndex + 1);
                }
            } else {
                //  Need to add items which are greater than currentMinRenderIndex and ltoe minRenderIndex
                if (minRenderIndex < currentMinRenderIndex) {
                    itemsToAdd = this.view.collection.slice(minRenderIndex, currentMinRenderIndex);
                }

                //  Need to remove items which are greater than the new maxRenderIndex
                if (maxRenderIndex < currentMaxRenderIndex) {
                    itemsToRemove = this.view.collection.slice(maxRenderIndex + 1, currentMaxRenderIndex + 1);
                }
            }

            if (itemsToAdd.length > 0 || itemsToRemove.length > 0) {
                this.minRenderIndex = minRenderIndex;
                this.maxRenderIndex = maxRenderIndex;

                var currentTotalRendered = (currentMaxRenderIndex - currentMinRenderIndex) + 1;

                if (direction === 'down') {
                    //  Items will be appended after oldMaxRenderIndex. 
                    this._addItems(itemsToAdd, currentMaxRenderIndex + 1, currentTotalRendered, true);
                } else {
                    this._addItems(itemsToAdd, minRenderIndex, currentTotalRendered, false);
                }

                this._removeItems(itemsToRemove);
                this._setHeightPaddingTop();
            }

            this.lastScrollTop = scrollTop;
        },
        
        _setHeightPaddingTop: function() {
            this._setPaddingTop();
            this._setHeight();
        },

        //  Adjust padding-top to properly position relative items inside of list since not all items are rendered.
        _setPaddingTop: function () {
            this.view.ui.childContainer.css('padding-top', this._getPaddingTop());
        },

        _getPaddingTop: function () {
            return this.minRenderIndex * this.childViewHeight;
        },

        //  Set the elements height calculated from the number of potential items rendered into it.
        //  Necessary because items are lazy-appended for performance, but scrollbar size changing not desired.
        _setHeight: function () {
            //  Subtracting minRenderIndex is important because of how CSS renders the element. If you don't subtract minRenderIndex
            //  then the rendered items will push up the height of the element by minRenderIndex * childViewHeight.
            var height = (this.view.collection.length - this.minRenderIndex) * this.childViewHeight;

            //  Keep height set to at least the viewport height to allow for proper drag-and-drop target - can't drop if height is too small.
            if (height < this.viewportHeight) {
                height = this.viewportHeight;
            }

            this.view.ui.childContainer.height(height);
        },

        _addItems: function (models, indexOffset, currentTotalRendered, isAddingToEnd) {
            var skippedCount = 0;

            var ChildView;
            _.each(models, function (model, index) {
                ChildView = this.view.getChildView(model);
                
                var shouldAdd = this._indexWithinRenderRange(index + indexOffset);

                if (shouldAdd) {
                    if (isAddingToEnd) {
                        //  Adjust the childView's index to account for where it is actually being added in the list
                        this._addChild(model, ChildView, index + currentTotalRendered - skippedCount, true);
                    } else {
                        //  Adjust the childView's index to account for where it is actually being added in the list, but
                        //  also provide the unmodified index because this is the location in the rendered childViewList in which it will be added.
                        this._addChild(model, ChildView, index, true);
                    }
                } else {
                    skippedCount++;
                }
            }, this);
        },
        
        //  Remove N items from the end of the render item list.
        _removeItemsByIndex: function (startIndex, countToRemove) {
            for (var index = 0; index < countToRemove; index++) {
                var item = this.view.collection.at(startIndex - index);
                var childView = this.view.children.findByModel(item);
                this.view.removeChildView(childView);
            }
        },

        _removeItems: function (models) {
            _.each(models, function (model) {
                var childView = this.view.children.findByModel(model);

                this.view.removeChildView(childView);
            }, this);
        },
        
        //  The bypass flag is set when shouldAdd has already been determined elsewhere. 
        //  This is necessary because sometimes the view's model's index in its collection is different than the view's index in the collectionview.
        //  In this scenario the index has already been corrected before _addChild is called so the index isn't a valid indicator of whether the view should be added.
        _addChild: function (child, ChildView, index, bypass) {
            var shouldAdd = bypass || this._indexWithinRenderRange(index);

            if (shouldAdd) {
                Backbone.Marionette.CompositeView.prototype.addChild.apply(this.view, arguments);
            }
        },

        _getMinRenderIndex: function (scrollTop) {
            var minRenderIndex = Math.floor(scrollTop / this.childViewHeight) - this.threshold;
            
            if (minRenderIndex < 0) {
                minRenderIndex = 0;
            }

            return minRenderIndex;
        },

        _getMaxRenderIndex: function (scrollTop) {
            //  Subtract 1 to make math 'inclusive' instead of 'exclusive'
            var maxRenderIndex = Math.ceil((scrollTop / this.childViewHeight) + (this.viewportHeight / this.childViewHeight)) - 1 + this.threshold;

            return maxRenderIndex;
        },

        //  Returns true if an childView at the given index would not be fully visible -- part of it rendering out of the top of the viewport.
        _indexOverflowsTop: function (index) {
            var position = index * this.childViewHeight;
            var scrollPosition = this.ui.list.scrollTop();

            var overflowsTop = position < scrollPosition;

            return overflowsTop;
        },

        _indexOverflowsBottom: function (index) {
            //  Add one to index because want to get the bottom of the element and not the top.
            var position = (index + 1) * this.childViewHeight;
            var scrollPosition = this.ui.list.scrollTop() + this.viewportHeight;

            var overflowsBottom = position > scrollPosition;

            return overflowsBottom;
        },

        _indexWithinRenderRange: function (index) {
            return index >= this.minRenderIndex && index <= this.maxRenderIndex;
        },
        
        //  Ensure that the active item is visible by setting the container's scrollTop to a position which allows it to be seen.
        _scrollToItem: function (item) {
            var itemIndex = this.view.collection.indexOf(item);

            var overflowsTop = this._indexOverflowsTop(itemIndex);
            var overflowsBottom = this._indexOverflowsBottom(itemIndex);

            //  Only scroll to the item if it isn't in the viewport.
            if (overflowsTop || overflowsBottom) {
                var scrollTop = 0;

                //  If the item needs to be made visible from the bottom, offset the viewport's height:
                if (overflowsBottom) {
                    //  Add 1 to index because want the bottom of the element and not the top.
                    scrollTop = (itemIndex + 1) * this.childViewHeight - this.viewportHeight;
                }
                else if (overflowsTop) {
                    scrollTop = itemIndex * this.childViewHeight;
                }

                this.ui.list.scrollTop(scrollTop);
            }
        },
        
        //  Reset min/max, scrollTop, paddingTop and height to their default values.
        _onCollectionReset: function () {
            this.ui.list.scrollTop(0);
            this.lastScrollTop = 0;

            this.minRenderIndex = this._getMinRenderIndex(0);
            this.maxRenderIndex = this._getMaxRenderIndex(0);

            this._setHeightPaddingTop();
        },
        
        _onCollectionRemove: function (item, collection, options) {
            //  When a rendered view is lost - render the next one since there's a spot in the viewport
            if (this._indexWithinRenderRange(options.index)) {
                var rendered = this._renderElementAtIndex(this.maxRenderIndex);

                //  If failed to render next item and there are previous items waiting to be rendered, slide view back 1 item
                if (!rendered && this.minRenderIndex > 0) {
                    this.ui.list.scrollTop(this.lastScrollTop - this.childViewHeight);
                }
            }

            this._setHeightPaddingTop();
        },
        
        _onCollectionAdd: function (item, collection) {
            var index = collection.indexOf(item);

            var indexWithinRenderRange = this._indexWithinRenderRange(index);

            //  Subtract 1 from collection.length because, for instance, if our collection has 8 items in it
            //  and min-max is 0-7, the 8th item in the collection has an index of 7.
            //  Use a > comparator not >= because we only want to run this logic when the viewport is overfilled and not just enough to be filled.
            var viewportOverfull = collection.length - 1 > this.maxRenderIndex;

            //  If a view has been rendered and it pushes another view outside of maxRenderIndex, remove that view.
            if (indexWithinRenderRange && viewportOverfull) {
                //  Adding one because I want to grab the item which is outside maxRenderIndex. maxRenderIndex is inclusive.
                this._removeItemsByIndex(this.maxRenderIndex + 1, 1);
            }

            this._setHeightPaddingTop();
        },
        
        _onCollectionChangeActive: function (item, active) {
            if (active) {
                this._scrollToItem(item);
            }
        }
    });

    return SlidingRender;
});
define('foreground/model/contextMenuActions',[],function() {
    'use strict';

    var Player = Streamus.backgroundPage.YouTubePlayer;
    var StreamItems = Streamus.backgroundPage.StreamItems;

    var ContextMenuActions = Backbone.Model.extend({
        addSongsToStream: function(songs) {
            StreamItems.addSongs(songs);
        },

        playSongsInStream: function(songs) {
            StreamItems.addSongs(songs, {
                playOnAdd: true
            });
        },

        copyUrl: function(songUrl) {
            chrome.extension.sendMessage({
                method: 'copy',
                text: songUrl
            });
        },

        copyTitleAndUrl: function(songTitle, songUrl) {
            chrome.extension.sendMessage({
                method: 'copy',
                text: '"' + songTitle + '" - ' + songUrl
            });
        },

        watchOnYouTube: function(songId, songUrl) {
            var url = songUrl;

            if (Player.get('loadedSongId') === songId) {
                url += '?t=' + Player.get('currentTime') + 's';
            }

            chrome.tabs.create({
                url: url
            });

            Player.pause();
        }
    });

    //  Only ever want one instance of ContextMenuActions; it's static.
    return new ContextMenuActions();
});
define('text!template/addToStreamButton.html',[],function () { return '<i class="fa fa-plus"></i>';});

define('foreground/view/addToStreamButtonView',[
    'foreground/view/behavior/tooltip',
    'text!template/addToStreamButton.html'
], function (Tooltip, AddToStreamButtonTemplate) {
    'use strict';

    var StreamItems = Streamus.backgroundPage.StreamItems;

    var AddToStreamButtonView = Backbone.Marionette.ItemView.extend({
        tagName: 'button',
        className: 'button-icon colored',
        template: _.template(AddToStreamButtonTemplate),
        
        attributes: {
            title: chrome.i18n.getMessage('add')
        },
        
        events: {
            'click': '_addToStream',
            'dblclick': '_addToStream'
        },
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },
        
        _addToStream: _.debounce(function () {
            StreamItems.addSongs(this.model.get('song'));

            //  Don't allow dblclick to bubble up to the list item and cause a play.
            return false;
        }, 100, true)
    });

    return AddToStreamButtonView;
});
define('text!template/deleteButton.html',[],function () { return '<i class="fa fa-trash-o"></i>';});

define('foreground/view/deleteButtonView',[
    'foreground/view/behavior/tooltip',
    'text!template/deleteButton.html'
], function (Tooltip, DeleteButtonTemplate) {
    'use strict';

    var DeleteButtonView = Backbone.Marionette.ItemView.extend({
        tagName: 'button',
        className: 'button-icon colored',
        template: _.template(DeleteButtonTemplate),
        
        attributes: {
            title: chrome.i18n.getMessage('delete')
        },
        
        events: {
            'click': '_doDelete'
        },
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },
        
        _doDelete: function () {
            this.model.destroy();
            
            //  Don't allow click to bubble up to the list item and cause a selection.
            return false;
        }
    });

    return DeleteButtonView;
});
define('foreground/view/listItemButtonsView',[],function() {
    'use strict';
    
    var ListItemButtonsView = Backbone.Marionette.ItemView.extend({
        template: _.template(),

        //  Render a collection of button views to keep things DRY between various types of list-items:        
        onRender: function () {
            var documentFragment = document.createDocumentFragment();
            this.shownButtonViews = [];

            _.each(this.options.buttonViews, function(ButtonView) {
                var buttonView = new ButtonView({
                    model: this.model
                });

                documentFragment.appendChild(buttonView.render().el);
                buttonView.triggerMethod('show');
                this.shownButtonViews.push(buttonView);
            }, this);

            this.$el.append(documentFragment);
        },
        
        onBeforeDestroy: function () {
            _.each(this.shownButtonViews, function (shownButtonView) {
                shownButtonView.destroy();
            });
            this.shownButtonViews.length = 0;
        }
    });

    return ListItemButtonsView;
});
define('foreground/view/multiSelectListItemView',[
    'foreground/view/listItemButtonsView',
    'foreground/view/behavior/tooltip'
], function (ListItemButtonsView, Tooltip) {
    'use strict';

    var MultiSelectListItemView = Backbone.Marionette.LayoutView.extend({
        className: 'list-item multi-select-item sliding-view-item',

        ui: {
            imageThumbnail: '.item-thumb',
            title: '.item-title'
        },

        events: {
            'contextmenu': '_showContextMenu',
            'mouseenter': '_onMouseEnter',
            'mouseleave': '_onMouseLeave'
        },

        modelEvents: {
            'change:selected': '_setSelectedClass'
        },
        
        regions: {
            buttonsRegion: '.region.list-item-buttons'
        },
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },

        templateHelpers: function () {
            return {
                hdMessage: chrome.i18n.getMessage('hd')
            };
        },
        
        onRender: function () {
            this._setSelectedClass();
        },
        
        _onMouseEnter: function () {
            this.buttonsRegion.show(new ListItemButtonsView({
                model: this.model,
                buttonViews: this.buttonViews
            }));
        },
        
        _onMouseLeave: function () {
            this.buttonsRegion.empty();
        },

        _setSelectedClass: function () {
            this.$el.toggleClass('selected', this.model.get('selected'));
        }
    });

    return MultiSelectListItemView;
});
define('text!template/playInStreamButton.html',[],function () { return '<i class="fa fa-play"></i>';});

define('foreground/view/playInStreamButtonView',[
    'foreground/view/behavior/tooltip',
    'text!template/playInStreamButton.html'
], function (Tooltip, PlayInStreamButtonTemplate) {
    'use strict';

    var StreamItems = Streamus.backgroundPage.StreamItems;
    var Player = Streamus.backgroundPage.YouTubePlayer;

    var PlayInStreamButtonView = Backbone.Marionette.ItemView.extend({
        tagName: 'button',
        className: 'button-icon colored',
        template: _.template(PlayInStreamButtonTemplate),
        
        attributes: {
            title: chrome.i18n.getMessage('play')
        },
        
        events: {
            'click': '_playInStream',
            'dblclick': '_playInStream'
        },
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },
        
        _playInStream: _.debounce(function () {
            var song = this.model.get('song');
            var streamItem = StreamItems.getBySong(song);

            if (_.isUndefined(streamItem)) {
                StreamItems.addSongs(song, {
                    playOnAdd: true
                });
            } else {
                if (streamItem.get('active')) {
                    Player.play();
                } else {
                    Player.playOnceSongChanges();
                    streamItem.save({ active: true });
                }
            }

            //  Don't allow dblclick to bubble up to the list item because that'll select it
            return false;
        }, 100, true)
    });

    return PlayInStreamButtonView;
});
define('text!template/listItem.html',[],function () { return '<!-- TODO: Not all ListItems can be saved. Doesn\'t really make sense to have this here. -->\r\n<div class="spinner small absolute-center above-fade-out"></div>\r\n\r\n<img class="item-thumb" src="http://img.youtube.com/vi/<%= song.get(\'id\') %>/default.jpg" />\r\n\r\n<span class="item-title text-tooltipable" title="<%= title %>">\r\n    <%= title %>\r\n</span>\r\n\r\n<span class="item-details">\r\n    <% if( song.get(\'highDefinition\') ) { %>\r\n        <%= hdMessage %> · \r\n    <% } %>\r\n    <span class="item-duration">\r\n        <%= song.get(\'prettyDuration\') %>\t\r\n    </span>\r\n</span>\r\n\r\n<span class="list-item-buttons region above-fade-out">\r\n</span>';});

define('foreground/view/leftBasePane/playlistItemView',[
    'foreground/collection/contextMenuItems',
    'foreground/model/contextMenuActions',
    'foreground/view/addToStreamButtonView',
    'foreground/view/deleteButtonView',
    'foreground/view/multiSelectListItemView',
    'foreground/view/playInStreamButtonView',
    'text!template/listItem.html'
], function (ContextMenuItems, ContextMenuActions, AddToStreamButtonView, DeleteButtonView, MultiSelectListItemView, PlayInStreamButtonView, ListItemTemplate) {
    'use strict';

    var PlaylistItemView = MultiSelectListItemView.extend({
        className: MultiSelectListItemView.prototype.className + ' playlist-item',

        template: _.template(ListItemTemplate),

        attributes: function () {
            return {
                'data-id': this.model.get('id'),
                'data-type': this.options.type
            };
        },

        events: _.extend({}, MultiSelectListItemView.prototype.events, {
            'dblclick': '_playInStream'
        }),
        
        modelEvents: _.extend({}, MultiSelectListItemView.prototype.modelEvents, {
            'change:id': '_setDataId _setSavingClass'
        }),
        
        buttonViews: [PlayInStreamButtonView, AddToStreamButtonView, DeleteButtonView],
        
        onRender: function () {
            this._setSavingClass();

            MultiSelectListItemView.prototype.onRender.apply(this, arguments);
        },
        
        //  If the playlistItem hasn't been successfully saved to the server -- show a saving spinner over the UI.
        _setSavingClass: function () {
            this.$el.toggleClass('saving', this.model.isNew());
        },
        
        _setDataId: function () {
            this.$el.data('id', this.model.get('id'));
        },
        
        _showContextMenu: function (event) {
            event.preventDefault();

            ContextMenuItems.reset([{
                    text: chrome.i18n.getMessage('copyUrl'),
                    onClick: this._copyUrl.bind(this)
                }, {
                    text: chrome.i18n.getMessage('copyTitleAndUrl'),
                    onClick: this._copyTitleAndUrl.bind(this)
                }, {
                    text: chrome.i18n.getMessage('deleteSong'),
                    onClick: this._destroyModel.bind(this)
                }, {
                    text: chrome.i18n.getMessage('add'),
                    onClick: this._addToStream.bind(this)
                }, {
                    text: chrome.i18n.getMessage('play'),
                    onClick: this._playInStream.bind(this)
                }, {
                    text: chrome.i18n.getMessage('watchOnYouTube'),
                    onClick: this._watchOnYouTube.bind(this)
                }]
            );
        },
        
        _addToStream: function () {
            ContextMenuActions.addSongsToStream(this.model.get('song'));
        },
        
        _copyUrl: function () {
            var songUrl = this.model.get('song').get('url');
            ContextMenuActions.copyUrl(songUrl);
        },
        
        _copyTitleAndUrl: function () {
            var songTitle = this.model.get('title');
            var songUrl = this.model.get('song').get('url');
            ContextMenuActions.copyTitleAndUrl(songTitle, songUrl);
        },
        
        _destroyModel: function () {
            this.model.destroy();
        },
        
        _playInStream: function() {
            ContextMenuActions.playSongsInStream(this.model.get('song'));
        },
        
        _watchOnYouTube: function () {
            var song = this.model.get('song');
            ContextMenuActions.watchOnYouTube(song.get('id'), song.get('url'));
        }
    });

    return PlaylistItemView;
});
define('foreground/model/genericPrompt',[],function () {
    'use strict';
    
    var GenericPrompt = Backbone.Model.extend({
        defaults: {
            title: '',
            okButtonText: chrome.i18n.getMessage('ok'),
            showOkButton: true,
            view: null
        }
    });

    return GenericPrompt;
});
define('foreground/model/saveSongs',[],function () {
    'use strict';

    var SaveSongs = Backbone.Model.extend({
        defaults: function () {
            return {
                creating: false,
                songs: []
            };
        }
    });

    return SaveSongs;
});
define('text!template/saveSongs.html',[],function () { return '<select class="submittable" placeholder="<%= typeToCreateOrFilterPlaylistsMessage %>..."></select>';});

define('foreground/view/saveSongsView',[
    'text!template/saveSongs.html'
], function (SaveSongsTemplate) {
    'use strict';

    var Playlists = Streamus.backgroundPage.Playlists;

    var SaveSongsView = Backbone.Marionette.ItemView.extend({
        className: 'save-songs',
        template: _.template(SaveSongsTemplate),

        templateHelpers: {
            typeToCreateOrFilterPlaylistsMessage: chrome.i18n.getMessage('typeToCreateOrFilterPlaylists')
        },
        
        ui: {
            playlistSelect: '.submittable',
            selectizeTitle: '.selectize-input .title'
        },

        onRender: function () {
            this.ui.playlistSelect.selectize(this._getSelectizeOptions());

            //  Default the control to the active playlist since this is the most common need.
            this.ui.playlistSelect[0].selectize.setValue(Playlists.getActivePlaylist().get('id'));

            //  Rebind UI elements after initializing selectize control in order to capture the appended DOM elements.
            this.bindUIElements();
        },
        
        validate: function () {
            var selectedPlaylistId = this.ui.playlistSelect.val();
            var isValid = selectedPlaylistId !== null && selectedPlaylistId.length > 0;

            return isValid;
        },
        
        _getSelectizeOptions: function () {
            var playlistOptions = Playlists.map(function (playlist) {
                return {
                    id: playlist.get('id'),
                    title: playlist.get('title'),
                    displayInfo: playlist.get('displayInfo')
                };
            });

            var selectizeOptions = {
                //  If false, items created by the user will not show up as available options once they are unselected.
                persist: false,
                maxItems: 1,
                mode: 'multi',
                //  The name of the property to use as the "value" when an item is selected.
                valueField: 'id',
                //  The name of the property to render as an option / item label.
                labelField: 'title',
                //  An array of property names to analyze when filtering options.
                searchField: ['title'],
                options: playlistOptions,
                //  This plugin adds classic a classic remove button to each item for behavior that mimics Select2 and Chosen.
                plugins: ['remove_button'],
                render: {
                    item: this._getSelectizeRenderItem.bind(this),
                    option: this._getSelectizeRenderOption.bind(this)
                },
                create: this._onSelectizeCreate.bind(this),
                onItemAdd: this._onSelectizeItemAdd.bind(this),
                onDelete: this._onSelectizeDelete.bind(this)
            };

            return selectizeOptions;
        },
        
        _getSelectizeRenderItem: function (item, escape) {
            return '<div>' + '<span class="title">' + escape(item.title) + '</span>' + '</div>';
        },
        
        _getSelectizeRenderOption: function (item, escape) {
            var activePlaylistId = Playlists.getActivePlaylist().get('id');

            var className = item.id === activePlaylistId ? 'selected' : '';
            var option = '<div class="' + className + '">';

            option += '<span class="label">' + escape(item.title) + '</span>';
            option += '<span class="caption">' + escape(item.displayInfo) + '</span>';

            option += '</div>';

            return option;
        },
        
        _onSelectizeCreate: function(input) {
            var createResult = false;
            var trimmedInput = $.trim(input);

            if (trimmedInput !== '') {
                createResult = {
                    id: _.uniqueId('newPlaylist_'),
                    title: trimmedInput
                };
            }

            this.model.set('creating', true);

            return createResult;
        },
        
        _onSelectizeItemAdd: function() {
            //  Rebind UI elements after adding an element to selectize control in order to capture the appended DOM elements.
            this.bindUIElements();
        },
        
        _onSelectizeDelete: function() {
            this.model.set('creating', false);
        },
        
        _doRenderedOk: function () {
            var selectedPlaylistId = this.ui.playlistSelect.val();

            if (this.model.get('creating')) {
                var playlistTitle = this.ui.selectizeTitle.text();
                Playlists.addPlaylistWithSongs(playlistTitle, this.model.get('songs'));
            } else {
                var selectedPlaylist = Playlists.get(selectedPlaylistId);
                selectedPlaylist.get('items').addSongs(this.model.get('songs'));
            }
        }
    });

    return SaveSongsView;
});
define('text!template/genericPrompt.html',[],function () { return '<div class="panel">\r\n    <div class="header table">\r\n        \r\n        <span class="title">\r\n            <%= title %>\r\n        </span>\r\n        \r\n        <button class="button-icon remove">\r\n            <i class="fa fa-times"></i>\r\n        </button>\r\n\r\n    </div>\r\n    <div class="divider"></div>\r\n    <div class="content">\r\n        \r\n    </div>\r\n    <span class="bottom-right">\r\n        <% if( showOkButton ) { %>\r\n        <button class="ok prompt-button button-label button-color">\r\n            <%= okButtonText %>\r\n        </button>\r\n        <% } %>\r\n    </span>\r\n</div>';});

define('foreground/view/prompt/genericPromptView',[
    'text!template/genericPrompt.html'
], function (GenericPromptTemplate) {
    'use strict';

    var GenericPromptView = Backbone.Marionette.ItemView.extend({
        className: 'prompt fixed-full-overlay',
        template: _.template(GenericPromptTemplate),

        events: {
            'click': '_hideIfClickOutsidePanel',
            'click .remove': 'hide',
            'click @ui.okButton': '_doRenderedOk',
            'keydown .submittable': '_doRenderedOkOnEnter'
        },
        
        ui: {
            panel: '.panel',
            content: '.content',
            okButton: 'button.ok'
        },
        
        initialize: function (options) {
            if (_.isUndefined(options) || _.isUndefined(options.containerHeight)) throw new Error('GenericPromptView expects to be initialized with a containerHeight');

            this.$el.addClass(this.model.get('view').className + '-prompt');
        },
        
        onRender: function () {
            //  Add specific content to the generic dialog's interior
            this.ui.content.append(this.model.get('view').render().el);
        },

        onShow: function () {
            //  Store original values in data attribute to be able to revert without magic numbers.
            this.$el.data('background', this.$el.css('background')).transition({
                'background': 'rgba(0, 0, 0, 0.5)'
            }, 'snap');

            //  Calculate center for prompt by finding the average difference between prompts height and its container
            var yTranslateCenter = (this.options.containerHeight - this.ui.panel.height()) / 2;
            
            this.ui.panel.transition({
                y: yTranslateCenter,
                opacity: 1
            }, 'snap');

            //  Be sure to tell the child view it has been shown!
            this.model.get('view').triggerMethod('show');
        },
        
        //  Unless a prompt specifically implements a reminder it is assumed that the reminder is not disabled and the prompt should always be shown when asked.
        reminderDisabled: function() {
            return false;
        },
        
        hide: function() {
            this.$el.transition({
                'background': this.$el.data('background')
            }, function () {
                var contentView = this.model.get('view');
                if (_.isFunction(contentView._doOnHide)) {
                    contentView._doOnHide();
                }

                this.destroy();
            }.bind(this));

            this.ui.panel.transition({
                y: 0,
                opacity: 0
            });
        },
        
        //  If the user clicks the 'dark' area outside the panel -- hide the panel.
        _hideIfClickOutsidePanel: function (event) {
            if (event.target == event.currentTarget) {
                this.hide();
            }
        },
        
        //  If the enter key is pressed on a submittable element, treat as if user pressed OK button.
        _doRenderedOkOnEnter: function(event) {
            if (event.which === 13) {
                this._doRenderedOk();
            }
        },
        
        _doRenderedOk: function () {
            //  Run validation logic if provided else assume valid
            var contentView = this.model.get('view');
            var isValid = _.isFunction(contentView.validate) ? contentView.validate() : true;
            
            if (isValid) {
                if (_.isFunction(contentView._doRenderedOk)) {
                    contentView._doRenderedOk();
                }

                this.hide();
            }
        }
    });

    return GenericPromptView;
});
define('foreground/view/prompt/saveSongsPromptView',[
    'foreground/model/genericPrompt',
    'foreground/model/saveSongs',
    'foreground/view/saveSongsView',
    'foreground/view/prompt/genericPromptView'
], function (GenericPrompt, SaveSongs, SaveSongsView, GenericPromptView) {
    'use strict';
    
    var SaveSongsPromptView = GenericPromptView.extend({
        initialize: function (options) {
            var saveSongs = new SaveSongs({
                songs: options.songs
            });

            this.model = new GenericPrompt({
                title: options.songs.length === 1 ? chrome.i18n.getMessage('saveSong') : chrome.i18n.getMessage('saveSongs'),
                okButtonText: chrome.i18n.getMessage('save'),
                view: new SaveSongsView({
                    model: saveSongs
                })
            });

            //  TODO: Reduce nesting
            this.listenTo(saveSongs, 'change:creating', function (creating) {
                if (creating) {
                    this.ui.okButton.text(chrome.i18n.getMessage('createPlaylist'));
                } else {
                    this.ui.okButton.text(chrome.i18n.getMessage('save'));
                }
            });

            GenericPromptView.prototype.initialize.apply(this, arguments);
        }
    });

    return SaveSongsPromptView;
});
define('text!template/saveToPlaylistButton.html',[],function () { return '<i class="fa fa-save"></i>';});

define('foreground/view/saveToPlaylistButtonView',[
    'foreground/view/behavior/tooltip',
    'foreground/view/prompt/saveSongsPromptView',
    'text!template/saveToPlaylistButton.html'
], function (Tooltip, SaveSongsPromptView, SaveToPlaylistButtonTemplate) {
    'use strict';

    var SignInManager = Streamus.backgroundPage.SignInManager;

    var SaveToPlaylistButtonView = Backbone.Marionette.ItemView.extend({
        tagName: 'button',
        className: 'button-icon colored',
        template: _.template(SaveToPlaylistButtonTemplate),
        
        attributes: {
            title: chrome.i18n.getMessage('cantSaveNotSignedIn')
        },

        events: {
            'click': '_saveToPlaylist',
            'dblclick': '_saveToPlaylist'
        },
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },

        initialize: function () {
            this.listenTo(SignInManager, 'change:signedIn', this._setTitleAndDisabled);
        },

        onRender: function() {
            this._setTitleAndDisabled();
        },

        _saveToPlaylist: _.debounce(function () {
            // Return false even on disabled button click so the click event does not bubble up and select the item. 
            if (!this.$el.hasClass('disabled')) {
                this._showSaveSongsPrompt();
            }

            //  Don't allow dblclick to bubble up to the list item and cause a play.
            return false;
        }, 100, true),
        
        _setTitleAndDisabled: function () {
            var signedIn = SignInManager.get('signedIn');

            var title = signedIn ? chrome.i18n.getMessage('save') : chrome.i18n.getMessage('cantSaveNotSignedIn');
            this.$el.attr('title', title).toggleClass('disabled', !signedIn);
        },
        
        _showSaveSongsPrompt: function() {
            Backbone.Wreqr.radio.channel('prompt').vent.trigger('show', SaveSongsPromptView, {
                songs: [this.model.get('song')]
            });
        }
    });

    return SaveToPlaylistButtonView;
});
define('foreground/view/leftCoveringPane/searchResultView',[
    'foreground/collection/contextMenuItems',
    'foreground/model/contextMenuActions',
    'foreground/view/addToStreamButtonView',
    'foreground/view/multiSelectListItemView',
    'foreground/view/playInStreamButtonView',
    'foreground/view/saveToPlaylistButtonView',
    'foreground/view/behavior/tooltip',
    'text!template/listItem.html'
], function (ContextMenuItems, ContextMenuActions, AddToStreamButtonView, MultiSelectListItemView, PlayInStreamButtonView, SaveToPlaylistButtonView, Tooltip, ListItemTemplate) {
    'use strict';

    var SearchResultView = MultiSelectListItemView.extend({
        className: MultiSelectListItemView.prototype.className + ' search-result',
        template: _.template(ListItemTemplate),

        attributes: function () {
            return {
                'data-id': this.model.get('id'),
                'data-type': this.options.type
            };
        },

        buttonViews: [PlayInStreamButtonView, AddToStreamButtonView, SaveToPlaylistButtonView],
        
        events: _.extend({}, MultiSelectListItemView.prototype.events, {
            'dblclick': '_playInStream'
        }),
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },
        
        _showContextMenu: function (event) {
            event.preventDefault();

            ContextMenuItems.reset([{
                    text: chrome.i18n.getMessage('play'),
                    onClick: this._playInStream.bind(this)
                }, {
                    text: chrome.i18n.getMessage('add'),
                    onClick: this._addToStream.bind(this)
                }, {
                    text: chrome.i18n.getMessage('copyUrl'),
                    onClick: this._copyUrl.bind(this)
                }, {
                    text: chrome.i18n.getMessage('copyTitleAndUrl'),
                    onClick: this._copyTitleAndUrl.bind(this)
                }, {
                    text: chrome.i18n.getMessage('watchOnYouTube'),
                    onClick: this._watchOnYouTube.bind(this)
                }]
            );
        },
        
        _addToStream: function() {
            ContextMenuActions.addSongsToStream(this.model.get('song'));
        },

        _playInStream: function () {
            ContextMenuActions.playSongsInStream(this.model.get('song'));
        },
        
        _copyUrl: function () {
            var songUrl = this.model.get('song').get('url');
            ContextMenuActions.copyUrl(songUrl);
        },

        _copyTitleAndUrl: function () {
            var songTitle = this.model.get('title');
            var songUrl = this.model.get('song').get('url');
            ContextMenuActions.copyTitleAndUrl(songTitle, songUrl);
        },

        _watchOnYouTube: function () {
            var song = this.model.get('song');
            ContextMenuActions.watchOnYouTube(song.get('id'), song.get('url'));
        }
    });

    return SearchResultView;
});
define('common/model/utility',[],function () {
    'use strict';

    var Utility = Backbone.Model.extend({
        //  Takes a time in seconds and converts it to something human-readable in the format of H:mm:ss or mm:ss.
        prettyPrintTime: function (timeInSeconds) {
            if (isNaN(timeInSeconds)) {
                timeInSeconds = 0;
            }

            var hours = Math.floor(timeInSeconds / 3600);
            var remainingSeconds = timeInSeconds % 3600;

            var minutes = Math.floor(remainingSeconds / 60);
            remainingSeconds = remainingSeconds % 60;

            //  Ensure two-digits for small numbers
            if (minutes < 10) {
                minutes = "0" + minutes;
            }

            if (remainingSeconds < 10) {
                remainingSeconds = "0" + remainingSeconds;
            }

            var timeString = minutes + ':' + remainingSeconds;

            if (hours > 0) {
                timeString = hours + ':' + timeString;
            }

            return timeString;
        },

        //  Converts an ISO8061 format (i.e: PT1H3M52S) to numeric representation in seconds.
        iso8061DurationToSeconds: function (isoDuration) {
            var hoursMatch = isoDuration.match(/(\d+)H/);
            var hours = parseInt(hoursMatch ? hoursMatch[1] : 0);

            var minutesMatch = isoDuration.match(/(\d+)M/);
            var minutes = parseInt(minutesMatch ? minutesMatch[1] : 0);

            var secondsMatch = isoDuration.match(/(\d+)S/);
            var seconds = parseInt(secondsMatch ? secondsMatch[1] : 0);

            var secondsDuration = seconds + (60 * minutes) + (60 * 60 * hours);
            return secondsDuration;
        },

        //  Inspired by the Chrome Last.fm Scrobbler extension by David Sabata (https://github.com/david-sabata/Chrome-Last.fm-Scrobbler)
        cleanTitle: function (title) {
            title = $.trim(title);
            title = title.replace(/\s*\*+\s?\S+\s?\*+$/, ''); // **NEW**
            title = title.replace(/\s*\[[^\]]+\]$/, ''); // [whatever]
            title = title.replace(/\s*\([^\)]*version\)$/i, ''); // (whatever version)
            title = title.replace(/\s*\.(avi|wmv|mpg|mpeg|flv)$/i, ''); // video extensions
            title = title.replace(/\s*(of+icial\s*)?(music\s*)?video/i, ''); // (official)? (music)? video
            title = title.replace(/\s*(ALBUM TRACK\s*)?(album track\s*)/i, ''); // (ALBUM TRACK)
            title = title.replace(/\s*\(\s*of+icial\s*\)/i, ''); // (official)
            title = title.replace(/\s*\(\s*[0-9]{4}\s*\)/i, ''); // (1999)
            title = title.replace(/\s+\(\s*(HD|HQ)\s*\)$/, ''); // HD (HQ)
            title = title.replace(/\s+(HD|HQ)\s*$/, ''); // HD (HQ)
            title = title.replace(/\s*video\s*clip/i, ''); // video clip
            title = title.replace(/\s+\(?live\)?$/i, ''); // live
            title = title.replace(/\(\s*\)/, ''); // Leftovers after e.g. (official video)
            title = title.replace(/\(.*lyrics?\)/i, ''); // (with lyrics)
            title = title.replace(/\s*with\s+lyrics?\s*$/i, ''); // with lyrics
            title = title.replace(/^(|.*\s)"(.*)"(\s.*|)$/, '$2'); // Artist - The new "Track title" featuring someone
            title = title.replace(/^(|.*\s)'(.*)'(\s.*|)$/, '$2'); // 'Track title'
            title = title.replace(/^[\/\s,:;~-\s"]+/, ''); // trim starting white chars and dash
            title = title.replace(/[\/\s,:;~-\s"\s!]+$/, ''); // trim trailing white chars and dash 

            return title;
        },

        //  http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
        escapeRegExp: function (string) {
            var escapedString = string.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
            return escapedString;
        },
        
        //  http://stackoverflow.com/questions/8847766/how-to-convert-json-to-csv-format-and-store-in-a-variable
        jsonToCsv: function(json) {
            var array = typeof json != 'object' ? JSON.parse(json) : json;
            var str = '';

            for (var i = 0; i < array.length; i++) {
                var line = '';
                for (var index in array[i]) {
                    if (line !== '') line += ',';

                    line += array[i][index];
                }

                str += line + '\r\n';
            }

            return str;
        }
    });

    return new Utility();
});
define('foreground/view/rightBasePane/streamItemView',[
    'common/model/utility',
    'foreground/collection/contextMenuItems',
    'foreground/model/contextMenuActions',
    'foreground/view/deleteButtonView',
    'foreground/view/multiSelectListItemView',
    'foreground/view/saveToPlaylistButtonView',
    'foreground/view/playInStreamButtonView',
    'text!template/listItem.html'
], function (Utility, ContextMenuItems, ContextMenuActions, DeleteButtonView, MultiSelectListItemView, SaveToPlaylistButtonView, PlayInStreamButtonView, ListItemTemplate) {
    'use strict';

    var Playlists = Streamus.backgroundPage.Playlists;
    var Player = Streamus.backgroundPage.YouTubePlayer;
    var SignInManager = Streamus.backgroundPage.SignInManager;
    var PlayPauseButton = Streamus.backgroundPage.PlayPauseButton;

    var StreamItemView = MultiSelectListItemView.extend({
        className: MultiSelectListItemView.prototype.className + ' stream-item',
        template: _.template(ListItemTemplate),

        attributes: function () {
            return {
                'data-id': this.model.get('id'),
                'data-type': this.options.type
            };
        },
        
        events: _.extend({}, MultiSelectListItemView.prototype.events, {
            'dblclick': '_activateAndPlayOrToggleState'
        }),
        
        modelEvents: _.extend({}, MultiSelectListItemView.prototype.modelEvents, {
            'change:id': '_setDataId',
            'change:active': '_setActiveClass'
        }),
        
        buttonViews: [PlayInStreamButtonView, SaveToPlaylistButtonView, DeleteButtonView],

        onRender: function () {
            this._setActiveClass();
            MultiSelectListItemView.prototype.onRender.apply(this, arguments);
        },

        _activateAndPlayOrToggleState: function () {
            if (!this.model.get('active')) {
                Player.playOnceSongChanges();

                this.model.save({ active: true });
            } else {
                PlayPauseButton.tryTogglePlayerState();
            }
        },
        
        _setDataId: function () {
            this.$el.data('id', this.model.get('id'));
        },

        //  Force the view to reflect the model's active class. It's important to do this here, and not through render always, because
        //  render will cause the lazy-loaded image to be reset.
        _setActiveClass: function () {
            var active = this.model.get('active');
            this.$el.toggleClass('active', active);
        },

        _showContextMenu: function (event) {
            //  Whenever a context menu is shown -- set preventDefault to true to let foreground know to not reset the context menu.
            event.preventDefault();

            var activePlaylist = Playlists.getActivePlaylist();
            var alreadyExists = false;
            
            var signedIn = SignInManager.get('signedIn');
            if (signedIn) {
                alreadyExists = activePlaylist.get('items').hasSong(this.model.get('song'));
            }

            var saveTitle = '';
            if (signedIn && alreadyExists) {
                saveTitle = chrome.i18n.getMessage('duplicatesNotAllowed');
            } else if (!signedIn) {
                saveTitle = chrome.i18n.getMessage('cantSaveNotSignedIn');
            }

            ContextMenuItems.reset([{
                    text: chrome.i18n.getMessage('save'),
                    title: saveTitle,
                    disabled: !signedIn || alreadyExists,
                    onClick: this._addToActivePlaylistItems.bind(this)
                }, {
                    text: chrome.i18n.getMessage('copyUrl'),
                    onClick: this._copyUrl.bind(this)
                }, {
                    text: chrome.i18n.getMessage('copyTitleAndUrl'),
                    onClick: this._copyTitleAndUrl.bind(this)
                }, {
                    text: chrome.i18n.getMessage('delete'),
                    onClick: this._destroyModel.bind(this)
                }, {
                    text: chrome.i18n.getMessage('watchOnYouTube'),
                    onClick: this._watchOnYouTube.bind(this)
                }]
            );
        },
        
        _addToActivePlaylistItems: function () {
            var activePlaylist = Playlists.getActivePlaylist();
            activePlaylist.get('items').addSongs(this.model.get('song'));
        },
        
        _copyUrl: function () {
            var songUrl = this.model.get('song').get('url');
            ContextMenuActions.copyUrl(songUrl);
        },

        _copyTitleAndUrl: function () {
            var songTitle = this.model.get('title');
            var songUrl = this.model.get('song').get('url');
            ContextMenuActions.copyTitleAndUrl(songTitle, songUrl);
        },
        
        _destroyModel: function () {
            this.model.destroy();
        },

        _watchOnYouTube: function () {
            var song = this.model.get('song');
            ContextMenuActions.watchOnYouTube(song.get('id'), song.get('url'));
        }
    });

    return StreamItemView;
});

define('foreground/view/behavior/sortable',[
    'common/enum/listItemType',
    'foreground/view/leftBasePane/playlistItemView',
    'foreground/view/leftCoveringPane/searchResultView',
    'foreground/view/rightBasePane/streamItemView'
], function (ListItemType, PlaylistItemView, SearchResultView, StreamItemView) {
    'use strict';

    var Playlists = Streamus.backgroundPage.Playlists;
    var Search = Streamus.backgroundPage.Search;
    var StreamItems = Streamus.backgroundPage.StreamItems;
    var SignInManager = Streamus.backgroundPage.SignInManager;
    
    var Sortable = Backbone.Marionette.Behavior.extend({
        onRender: function () {
            this.view.ui.childContainer.sortable(this._getSortableOptions());
        },
        
        _getSortableOptions: function() {
            var self = this;

            var sortableOptions = {
                //  Append to body so that the placeholder appears above all other elements instead of under when dragging between regions.
                appendTo: 'body',

                connectWith: '.droppable-list',

                cursorAt: {
                    right: 35,
                    bottom: 40
                },

                //  Adding a delay helps preventing unwanted drags when clicking on an element.
                delay: 100,

                placeholder: 'sortable-placeholder list-item hidden',

                helper: function(ui, listItem) {
                    //  Create a new view instead of just copying the HTML in order to preserve HTML->Backbone.View relationship
                    var copyHelperView;
                    var viewOptions = {
                        model: self.view.collection.get(listItem.data('id'))
                    };

                    var listItemType = listItem.data('type');

                    switch (listItemType) {
                    case ListItemType.PlaylistItem:
                        copyHelperView = new PlaylistItemView(viewOptions);
                        break;
                    case ListItemType.StreamItem:
                        copyHelperView = new StreamItemView(viewOptions);
                        break;
                    case ListItemType.SearchResult:
                        copyHelperView = new SearchResultView(viewOptions);
                        break;
                    default:
                        throw new Error('Unhandled ListItemType: ' + listItemType);
                    }

                    this.copyHelperView = copyHelperView;
                    this.copyHelper = copyHelperView.render().$el.insertAfter(listItem);
                    this.copyHelper.addClass('copy-helper');

                    this.backCopyHelper = listItem.prev();
                    this.backCopyHelper.addClass('copy-helper');

                    $(this).data('copied', false);

                    return $('<span>', {
                        'class': 'droppable-selected-models'
                    });
                },
                change: function() {
                    //  There's a CSS redraw issue with my CSS selector: .listItem.copyHelper + .sortable-placeholder 
                    //  So, I manually hide the placeholder (like it would be normally) until a change occurs -- then the CSS can take over.
                    if (this.needFixCssRedraw) {
                        $('.sortable-placeholder.hidden').removeClass('hidden');
                        this.needFixCssRedraw = false;
                    }
                },
                start: function(event, ui) {
                    self.view.triggerMethod('ItemDragged', self.view.collection.get(ui.item.data('id')));

                    this.needFixCssRedraw = true;

                    var listItemType = ui.item.data('type');

                    //  TODO: This logic prevents dragging a duplicate streamItem to a Playlist, but I also would like to prevent
                    //  duplicates in the Stream.
                    if (listItemType === ListItemType.StreamItem) {
                        if (SignInManager.get('signedIn')) {
                            var streamItemId = ui.item.data('id');

                            //  Color the placeholder to indicate that the StreamItem can't be copied into the Playlist.
                            var draggedStreamItem = self.view.collection.get(streamItemId);

                            var alreadyExists = Playlists.getActivePlaylist().get('items').hasSong(draggedStreamItem.get('song'));
                            ui.placeholder.toggleClass('no-drop', alreadyExists);
                        } else {
                            ui.placeholder.addClass('not-signed-in');
                        }
                    }

                    this.selectedItems = self.view.$el.find('.selected');

                    this.selectedItems.css({
                        opacity: '.5'
                    });

                    //  Set it here not in helper because dragStart may select a search result.
                    ui.helper.text(self.view.collection.selected().length);

                    //  Override sortableItem here to ensure that dragging still works inside the normal parent collection.
                    //  http://stackoverflow.com/questions/11025470/jquery-ui-sortable-scrolling-jsfiddle-example
                    var placeholderParent = ui.placeholder.parent().parent();

                    ui.item.data('sortableItem').scrollParent = placeholderParent;
                    ui.item.data('sortableItem').overflowOffset = placeholderParent.offset();
                },

                stop: function(event, ui) {
                    this.backCopyHelper.removeClass('copy-helper');

                    var copied = $(this).data('copied');
                    if (copied) {
                        this.copyHelper.removeClass('copy-helper');
                    } else {
                        this.copyHelperView.destroy();

                        //  Whenever a PlaylistItem or StreamItem row is reorganized -- update.
                        var listItemType = ui.item.data('type');
                        if (listItemType === ListItemType.PlaylistItem || listItemType === ListItemType.StreamItem) {
                            //  Index inside of receive may be incorrect if the user is scrolled down -- some items will have been unrendered.
                            //  Need to pad the index with the # of missing items.
                            self.view.listenToOnce(self.view, 'GetMinRenderIndexReponse', function (response) {
                                //  TODO: This has a bug in it. If you drag an item far enough to exceed the render threshold then it doesn't properly find the index. :(
                                var index = ui.item.index() + response.minRenderIndex;
                                self.view.collection.moveToIndex(ui.item.data('id'), index);
                            });

                            self.view.triggerMethod('GetMinRenderIndex');
                        }
                    }

                    this.selectedItems.css({
                        opacity: '1'
                    });

                    this.copyHelper = null;
                    this.backCopyHelper = null;
                    this.selectedItems = null;

                    //  Don't allow SearchResults to be sorted -- copied is true when it moves to StreamItems.
                    //  Returning false cancels the sort.
                    var isSearchResult = ui.item.data('type') === ListItemType.SearchResult;

                    return copied || !isSearchResult;
                },

                tolerance: 'pointer',
                receive: function(event, ui) {
                    //  Index inside of receive may be incorrect if the user is scrolled down -- some items will have been unrendered.
                    //  Need to pad the index with the # of missing items.
                    self.view.listenToOnce(self.view, 'GetMinRenderIndexReponse', function(response) {
                        var index = ui.item.index() + response.minRenderIndex;

                        var listItemType = ui.item.data('type');

                        var draggedModels = [];
                        if (listItemType === ListItemType.StreamItem) {
                            draggedModels = StreamItems.selected();
                            StreamItems.deselectAll();
                        } else if (listItemType === ListItemType.PlaylistItem) {
                            var activePlaylistItems = Playlists.getActivePlaylist().get('items');
                            draggedModels = activePlaylistItems.selected();
                            activePlaylistItems.deselectAll();
                        } else if (listItemType === ListItemType.SearchResult) {
                            var searchResults = Search.get('results');
                            draggedModels = searchResults.selected();
                            searchResults.deselectAll();
                        }

                        var songs = _.map(draggedModels, function(model) {
                            return model.get('song');
                        });

                        self.view.collection.addSongs(songs, {
                            index: index
                        });

                        //  Swap copy helper out with the actual item once successfully dropped because Marionette keeps track of specific view instances.
                        //  Don't swap it out until done using its dropped-position index.
                        ui.sender[0].copyHelper.replaceWith(ui.item);
                        ui.sender[0].copyHelperView.destroy();

                        ui.sender.data('copied', true);
                    });

                    self.view.triggerMethod('GetMinRenderIndex');
                },

                over: function(event, ui) {
                    //  Override jQuery UI's sortableItem to allow a dragged item to scroll another sortable collection.
                    // http://stackoverflow.com/questions/11025470/jquery-ui-sortable-scrolling-jsfiddle-example
                    var placeholderParent = ui.placeholder.parent().parent();

                    ui.item.data('sortableItem').scrollParent = placeholderParent;
                    ui.item.data('sortableItem').overflowOffset = placeholderParent.offset();
                }
            };

            return sortableOptions;
        }
    });

    return Sortable;
});
define('text!template/activePlaylistArea.html',[],function () { return '<div class="big-text-wrapper full flex-column">\r\n    <div class="big-text playlist-empty">\r\n        <div class="header">\r\n            <%= playlistEmptyMessage %>\r\n        </div>\r\n        <%= wouldYouLikeToMessage %> <span class="show-search search-link clickable lowercase"><%= searchForSongsMessage %></span>?\r\n    </div>\r\n    \r\n    <div class="list">\r\n        <div class="active-playlist-items droppable-list">\r\n        </div>\r\n    </div>\r\n</div>\r\n\r\n<div class="bottom-menubar">\r\n    <div class="playlist-details lowercase text-tooltipable pull-left" title="<%= displayInfo %>">\r\n        <%= displayInfo %>\r\n    </div>\r\n    <div class="playlist-actions pull-right">\r\n        <button class="button-label play-all">\r\n            <i class="fa fa-play"></i><%= playAllMessage %>\r\n        </button>\r\n\r\n        <button class="button-label add-all">\r\n            <i class="fa fa-plus"></i><%= addAllMessage %>\r\n        </button>\r\n    </div>\r\n</div>';});

define('foreground/view/leftBasePane/activePlaylistAreaView',[
    'common/enum/listItemType',
    'foreground/view/behavior/multiSelect',
    'foreground/view/behavior/slidingRender',
    'foreground/view/behavior/sortable',
    'foreground/view/behavior/tooltip',
    'foreground/view/leftBasePane/playlistItemView',
    'text!template/activePlaylistArea.html'
], function (ListItemType, MultiSelect, SlidingRender, Sortable, Tooltip, PlaylistItemView, ActivePlaylistAreaTemplate) {
    'use strict';

    var StreamItems = Streamus.backgroundPage.StreamItems;

    var ActivePlaylistAreaView = Backbone.Marionette.CompositeView.extend({
        className: 'active-playlist-area full flex-column',
        childView: PlaylistItemView,
        childViewContainer: '@ui.childContainer',
        template: _.template(ActivePlaylistAreaTemplate),
        
        templateHelpers: function () {
            return {
                showSearchMessage: chrome.i18n.getMessage('showSearch'),
                searchForSongsMessage: chrome.i18n.getMessage('searchForSongs'),
                playlistEmptyMessage: chrome.i18n.getMessage('playlistEmpty'),
                wouldYouLikeToMessage: chrome.i18n.getMessage('wouldYouLikeTo'),
                addAllMessage: chrome.i18n.getMessage('addAll'),
                playAllMessage: chrome.i18n.getMessage('playAll')
            };
        },
        
        //  Overwrite resortView to only render children as expected
        resortView: function () {
            this._renderChildren();
        },
        
        childViewOptions: {
            type: ListItemType.PlaylistItem
        },

        ui: {
            playlistDetails: '.playlist-details',
            playlistEmptyMessage: '.playlist-empty',
            bottomMenubar: '.bottom-menubar',
            childContainer: '.active-playlist-items',
            bigTextWrapper: '.big-text-wrapper',
            playAll: '.play-all',
            addAll: '.add-all'
        },
        
        events: {
            'click @ui.addAll': '_addAllToStream',
            'click @ui.playAll': '_playAllInStream'
        },
        
        modelEvents: {
            'change:displayInfo': '_onModelChangeDisplayInfo'
        },
        
        collectionEvents: {
            'add remove reset': '_setViewState'
        },
        
        behaviors: function () {
            return {
                MultiSelect: {
                    behaviorClass: MultiSelect,
                },
                SlidingRender: {
                    behaviorClass: SlidingRender
                },
                Sortable: {
                    behaviorClass: Sortable
                },
                Tooltip: {
                    behaviorClass: Tooltip
                }
            };
        },

        onRender: function () {
            this._setViewState();
        },
        
        //  Ensure that the proper UI elements are being shown based on the state of the collection
        _setViewState: function () {
            this._toggleBigText();
            this._toggleBottomMenubar();
        },
        
        _onModelChangeDisplayInfo: function (model, displayInfo) {
            this._updatePlaylistDetails(displayInfo);
        },

        _updatePlaylistDetails: function (displayInfo) {
            this.ui.playlistDetails.text(displayInfo);
        },
       
        //  Set the visibility of any visible text messages.
        _toggleBigText: function () {
            this.ui.playlistEmptyMessage.toggleClass('hidden', this.collection.length > 0);
        },
        
        _toggleBottomMenubar: function () {
            this.ui.bottomMenubar.toggle(this.collection.length > 0);
            //  Need to update viewportHeight in slidingRender behavior:
            this.triggerMethod('ListHeightUpdated');
        },

        _addAllToStream: function () {
            StreamItems.addSongs(this.model.get('items').pluck('song'));
        },
        
        _playAllInStream: function () {
            StreamItems.addSongs(this.model.get('items').pluck('song'), {
                playOnAdd: true
            });
        }
    });

    return ActivePlaylistAreaView;
});
define('text!template/playlistTitle.html',[],function () { return '<%= title %>';});

define('foreground/view/leftBasePane/playlistTitleView',[
    'foreground/view/behavior/tooltip',
    'text!template/playlistTitle.html'
], function (Tooltip, PlaylistTitleTemplate) {
    'use strict';

    var PlaylistTitleView = Backbone.Marionette.ItemView.extend({
        className: 'text-tooltipable playlist-title',
        template: _.template(PlaylistTitleTemplate),
        
        modelEvents: {
            'change:title': 'render'
        },
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },
        
        onRender: function () {
            this._setTitle();
        },
        
        _setTitle: function() {
            this.$el.attr('title', this.model.get('title'));
        }
    });

    return PlaylistTitleView;
});
define('text!template/signIn.html',[],function () { return '<div class="big-text-wrapper full flex-column">\r\n    <div class="big-text signing-in">\r\n        <div class="header"><%= signingInMessage %>...</div>\r\n        <div class="spinner medium text-center"></div>\r\n    </div>\r\n    \r\n    <div class="big-text sign-in">\r\n        <div class="header search-link clickable"><%= signInMessage %></div>\r\n    </div>\r\n    \r\n    <div class="big-text sign-in-failed">\r\n        <div class="header"><%= signInFailedMessage %></div>\r\n        <%= pleaseWaitMessage %> <span id="sign-in-retry-timer"><%= signInRetryTimer %></span>\r\n    </div>\r\n</div>';});

define('foreground/view/leftBasePane/signInView',[
    'text!template/signIn.html'
], function (SignInTemplate) {
    'use strict';

    var SignInView = Backbone.Marionette.ItemView.extend({
        id: 'sign-in',
        template: _.template(SignInTemplate),
        
        templateHelpers: function () {
            return {
                signingInMessage: chrome.i18n.getMessage('signingIn'),
                signInMessage: chrome.i18n.getMessage('signIn'),
                signInFailedMessage: chrome.i18n.getMessage('signInFailed'),
                pleaseWaitMessage: chrome.i18n.getMessage('pleaseWait')
            };
        },

        ui: {
            signingInMessage: '.signing-in',
            signInPrompt: '.sign-in',
            signInLink: '.sign-in .clickable',
            signInFailedMessage: '.sign-in-failed',
            signInRetryTimer: '#sign-in-retry-timer'
        },

        events: {
            'click @ui.signInLink': '_signIn'
        },

        modelEvents: {
            'change:signInFailed': '_toggleBigText',
            'change:signingIn': '_toggleBigText',
            'change:signInRetryTimer': '_updateSignInRetryTimer'
        },
        
        onRender: function () {
            this._toggleBigText();
        },

        _updateSignInRetryTimer: function () {
            this.ui.signInRetryTimer.text(this.model.get('signInRetryTimer'));
        },

        //  Set the visibility of any visible text messages.
        _toggleBigText: function () {
            var signingIn = this.model.get('signingIn');
            var signInFailed = this.model.get('signInFailed');

            this.ui.signInFailedMessage.toggleClass('hidden', !signInFailed);
            this.ui.signingInMessage.toggleClass('hidden', !signingIn);
            this.ui.signInPrompt.toggleClass('hidden', signingIn || signInFailed);
        },

        _signIn: function () {
            this.model.signInWithGoogle();
        }
    });

    return SignInView;
});
define('text!template/leftBasePane.html',[],function () { return '<div class="top-bar table">\r\n    <button class="button-icon show show-playlists-area tooltipable">\r\n        <i class="fa fa-reorder"></i>\r\n    </button>\r\n    \r\n    <div class="playlist-title region"></div>\r\n    \r\n    <button class="button-icon show-search tooltipable" title="<%= showSearchMessage %>">\r\n        <i class="fa fa-search"></i>\r\n    </button>\r\n</div>\r\n\r\n<div class="divider"></div>\r\n\r\n<div class="content region full flex-column"></div>';});

define('foreground/view/leftBasePane/leftBasePaneView',[
    'foreground/view/behavior/tooltip',
    'foreground/view/leftBasePane/activePlaylistAreaView',
    'foreground/view/leftBasePane/playlistTitleView',
    'foreground/view/leftBasePane/signInView',
    'text!template/leftBasePane.html'
], function (Tooltip, ActivePlaylistAreaView, PlaylistTitleView, SignInView, LeftBasePaneTemplate) {
    'use strict';

    var Playlists = Streamus.backgroundPage.Playlists;
    var SignInManager = Streamus.backgroundPage.SignInManager;

    var LeftBasePaneView = Backbone.Marionette.LayoutView.extend({
        className: 'left-pane full flex-column',
        template: _.template(LeftBasePaneTemplate),
        
        templateHelpers: function () {
            return {
                showSearchMessage: chrome.i18n.getMessage('showSearch')
            };
        },

        ui: {
            showSearch: '.show-search',
            showPlaylistsArea: '.show-playlists-area'
        },
        
        events: {
            'click @ui.showSearch': function () {
                Backbone.Wreqr.radio.channel('global').vent.trigger('showSearch', true);
            },

            'click @ui.showPlaylistsArea': function () {
                Backbone.Wreqr.radio.channel('global').vent.trigger('showPlaylistsArea');
            }
        },

        regions: {
            playlistTitleRegion: '.region.playlist-title',
            contentRegion: '.region.content'
        },
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },
        
        initialize: function () {
            this.listenTo(SignInManager, 'change:signedIn', this._updateRegions);
            this.listenTo(Playlists, 'change:active', this._onActivePlaylistChange);
        },
        
        onShow: function () {
            this._updateRegions();
        },
        
        _updateRegions: function () {
            if (SignInManager.get('signedIn')) {
                this._showActivePlaylistContent();
            } else {
                this._showSignInContent();
            }
        },
        
        //  If the user is signed in -- show the user's active playlist items / information.
        _showActivePlaylistContent: function() {
            var activePlaylist = Playlists.getActivePlaylist();

            this.contentRegion.show(new ActivePlaylistAreaView({
                model: activePlaylist,
                collection: activePlaylist.get('items')
            }));

            this.playlistTitleRegion.show(new PlaylistTitleView({
                model: activePlaylist
            }));
        },
        
        _showSignInContent: function() {
            //  Don't continously generate the signIn view if it's already visible because the view itself is trying to update its state
            //  and if you rip out the view while it's trying to update -- Marionette will throw errors saying elements don't have events/methods.
            if (!(this.contentRegion.currentView instanceof SignInView)) {
                //  Otherwise, allow the user to sign in by showing a sign in prompt.
                this.contentRegion.show(new SignInView({
                    model: SignInManager
                }));

                this.playlistTitleRegion.empty();
            }
        },
        
        _onActivePlaylistChange: function(playlist, active) {
            //  Don't call updateRegions when a playlist is de-activated because don't want to redraw twice -- expensive!
            if (active) {
                this._updateRegions();
            }
        }
    });

    return LeftBasePaneView;
});
define('foreground/view/leftBasePane/leftBasePaneRegion',[
    'foreground/view/leftBasePane/leftBasePaneView'
], function (LeftBasePaneView) {
    'use strict';

    var LeftBasePaneRegion = Backbone.Marionette.Region.extend({
        //  TODO: I am required to use ID selector here until bug resolved: https://github.com/marionettejs/backbone.marionette/issues/1530
        el: '#left-base-pane-region',
        
        initialize: function() {
            this.show(new LeftBasePaneView());
        }
    });

    return LeftBasePaneRegion;
});
define('common/enum/dataSourceType',{
    None: -1,
    Unknown: 0,
    YouTubePlaylist: 1,
    SharedPlaylist: 2,
    UserInput: 3,
    YouTubeVideo: 4
});
define('common/enum/youTubeServiceType',{
    Search: 'search',
    PlaylistItems: 'playlistItems',
    Videos: 'videos',
    Channels: 'channels',
    Playlists: 'playlists'
});
define('common/enum/songType',{
    None: 0,
    YouTube: 1,
    SoundCloud: 2
});
define('common/model/youTubeV3API',[
    'common/enum/songType',
    'common/enum/youTubeServiceType',
    'common/model/utility'
], function (SongType, YouTubeServiceType, Utility) {
    'use strict';

    var YouTubeV3API = Backbone.Model.extend({
        //  Performs a search and then grabs the first item most related to the search title by calculating
        //  the levenshtein distance between all the possibilities and returning the result with the lowest distance.
        //  Expects options: { title: string, success: function, error: function }
        getSongInformationByTitle: function (options) {
            return this.search({
                text: options.title,
                //  Expect to find a playable song within the first 10 -- don't need the default 50 items
                maxResults: 10,
                success: function (response) {
                    if (response.songInformationList.length === 0) {
                        if (options.error) options.error('No playable song found after searching with title ' + options.title);
                    } else {
                        options.success(response.songInformationList[0]);
                    }
                },
                error: options.error,
                complete: options.complete
            });
        },
        
        //  Performs a search of YouTube with the provided text and returns a list of playable songs (<= max-results)
        //  Expects options: { maxResults: integer, text: string, fields: string, success: function, error: function }
        search: function (options) {
            return this._doRequest(YouTubeServiceType.Search, {
                success: function (response) {
                    var songIds = _.map(response.items, function (item) {
                        return item.id.videoId;
                    });
                    
                    this.getSongInformationList({
                        songIds: songIds,
                        success: options.success,
                        error: options.error,
                        complete: options.complete
                    });
                }.bind(this),
                error: function(error) {
                    if (options.error) options.error(error);
                    if (options.complete) options.complete();
                }
            }, {
                part: 'id',
                //  Probably set this to its default of video/playlist/channel at some point.
                type: 'video',
                maxResults: options.maxResults || 50,
                q: $.trim(options.text),
                fields: 'items/id/videoId',
                //  I don't think it's a good idea to filter out results based on safeSearch for music.
                safeSearch: 'none'
            });
        },
        
        getChannelUploadsPlaylistId: function (options) {
            var listOptions = {
                part: 'contentDetails',
                fields: 'items/contentDetails/relatedPlaylists/uploads'
            };
            
            if (!_.isUndefined(options.username)) {
                _.extend(listOptions, {
                    forUsername: options.username
                });
            }
            else if (!_.isUndefined(options.channelId)) {
                _.extend(listOptions, {
                    id: options.channelId
                });
            }
            
            return this._doRequest('channels', {
                success: function (response) {
                    if (_.isUndefined(response.items[0])) {
                        throw new Error("No response.items found for options:", JSON.stringify(options));
                    }

                    options.success({
                        uploadsPlaylistId: response.items[0].contentDetails.relatedPlaylists.uploads
                    });
                },
                error: options.error,
                complete: options.complete
            }, listOptions);
        },
        
        getSongInformation: function (options) {
            return this.getSongInformationList({
                songIds: [options.songId],
                success: function (response) {
                    if (response.missingSongIds.length === 1) {
                        options.error('Failed to find song ' + options.songId);
                    } else {
                        options.success(response.songInformationList[0]);
                    }
                },
                error: options.error,
                complete: options.complete
            });
        },

        //  Returns the results of a request for a segment of a channel, playlist, or other dataSource.
        getPlaylistSongInformationList: function (options) {
            return this._doRequest(YouTubeServiceType.PlaylistItems, {
                success: function (response) {
                    var songIds = _.map(response.items, function (item) {
                        return item.contentDetails.videoId;
                    });

                    this.getSongInformationList({
                        songIds: songIds,
                        success: function (songInformationListResponse) {
                            options.success(_.extend({
                                nextPageToken: response.nextPageToken,
                            }, songInformationListResponse));
                        },
                        error: options.error,
                        complete: options.complete
                    });
                }.bind(this),
                error: function(error) {
                    if (options.error) options.error(error);
                    if (options.complete) options.complete();
                }
            }, {
                part: 'contentDetails',
                maxResults: 50,
                playlistId: options.playlistId,
                pageToken: options.pageToken || '',
                fields: 'nextPageToken, items/contentDetails/videoId'
            });
        },

        getRelatedSongInformationList: function (options) {
            return this._doRequest(YouTubeServiceType.Search, {
                success: function (response) {
                    if (!response) {
                        throw new Error("No response for: ", JSON.stringify(options));
                    }

                    var songIds = _.map(response.items, function (item) {
                        return item.id.videoId;
                    });

                    this.getSongInformationList({
                        songIds: songIds,
                        success: function (songInformationListResponse) {
                            //  OK to drop missingSongIds; not expecting any because YouTube determines related song ids.
                            options.success(songInformationListResponse.songInformationList);
                        },
                        error: options.error,
                        complete: options.complete
                    });
                }.bind(this),
                error: function(error) {
                    if (options.error) options.error(error);
                    if (options.complete) options.complete();
                }
            }, {
                part: 'id',
                relatedToVideoId: options.songId,
                maxResults: options.maxResults || 5,
                //  If the relatedToVideoId parameter has been supplied, type must be video.
                type: 'video',
                fields: 'items/id/videoId'
            });
        },
        
        //  Converts a list of YouTube song ids into actual video information by querying YouTube with the list of ids.
        getSongInformationList: function (options) {
            return this._doRequest(YouTubeServiceType.Videos, {
                success: function (response) {
                    if (_.isUndefined(response.items)) {
                        if (options.error) options.error('The response\'s item list was undefined. Song(s) may have been banned.');
                    } else {
                        var songInformationList = _.map(response.items, function (item) {
                            return {
                                id: item.id,
                                duration: Utility.iso8061DurationToSeconds(item.contentDetails.duration),
                                title: item.snippet.title,
                                author: item.snippet.channelTitle,
                                type: SongType.YouTube
                            };
                        });

                        var missingSongIds = _.difference(options.songIds, _.pluck(songInformationList, 'id'));

                        options.success({
                            songInformationList: songInformationList,
                            missingSongIds: missingSongIds
                        });
                    }
                },
                error: options.error,
                complete: options.complete
            }, {
                part: 'contentDetails, snippet',
                maxResults: 50,
                id: options.songIds.join(','),
                fields: 'items/id, items/contentDetails/duration, items/snippet/title, items/snippet/channelTitle'
            });
        },
        
        //  Expects options: { channelId: string, success: function, error: function };
        getTitle: function (options) {
            var ajaxDataOptions = {
                part: 'snippet',
                fields: 'items/snippet/title'
            };
            
            if (!_.isUndefined(options.id)) {
                ajaxDataOptions.id = options.id;
            }
            else if (!_.isUndefined(options.forUsername)) {
                ajaxDataOptions.forUsername = options.forUsername;
            } else {
                throw new Error('Expected id or forUsername');
            }

            return this._doRequest(options.serviceType, {
                success: function (response) {
                    if (response.items.length === 0) {
                        options.error('No title found');
                    } else {
                        options.success(response.items[0].snippet.title);
                    }
                },
                error: options.error,
                complete: options.complete
            }, ajaxDataOptions);
        },

        _doRequest: function (serviceType, ajaxOptions, ajaxDataOptions) {
            return $.ajax(_.extend(ajaxOptions, {
                url: 'https://www.googleapis.com/youtube/v3/' + serviceType,
                data: _.extend({
                    //  The Simple API Access API key is used here. Please note that it is set to allow "Referers: Any referer allowed" because
                    //  a Google Chrome extension does not send a referer by design. As such, it seems easiest to allow any referer rather than try to 
                    //  fix the extension for slightly improved security.
                    //  https://code.google.com/apis/console/b/0/?noredirect&pli=1#project:346456917689:access
                    key: 'AIzaSyBWegNdKdnwKGr2bCKRzqXnWw00kA7T2lk'
                }, ajaxDataOptions)
            }));
        }
    });

    return new YouTubeV3API();
});
define('common/model/dataSource',[
    'common/enum/dataSourceType',
    'common/enum/youTubeServiceType',
    'common/model/youTubeV3API'
], function (DataSourceType, YouTubeServiceType, YouTubeV3API) {
    'use strict';

    var DataSource = Backbone.Model.extend({
        defaults: {
            type: DataSourceType.None,
            //  Valid song ID can appear in a playlist URL so provide the ability to only pull out a playlist URL
            parseVideo: true,
            //  The songId, playlistId, channelId etc..
            id: '',
            title: '',
            url: ''
        },
        
        //  TODO: Function is way too big
        //  Take the URL given to the dataSource and parse it for relevant information.
        //  If the URL is for a Playlist -- just get the title and set the ID. If it's a Channel,
        //  need to fetch the Channel's Uploads playlist first.
        parseUrl: function (options) {
            var url = this.get('url');
            if (url === '') throw new Error('URL expected to be set');
            
            var dataSourceId;

            //  URLs could have both video id + playlist id. Use a flag to determine whether video id is important
            if (this.get('parseVideo')) {
                dataSourceId = this._parseYouTubeSongIdFromUrl(url);

                if (dataSourceId !== '') {
                    this.set({
                        type: DataSourceType.YouTubeVideo,
                        id: dataSourceId
                    });

                    options.success();
                    return;
                }
            }

            //  Try to find a playlist id if no video id was found.
            dataSourceId = this._parseIdFromUrlWithIdentifiers(url, ['list=', 'p=']);

            if (dataSourceId !== '') {
                this.set({
                    type: DataSourceType.YouTubePlaylist,
                    id: dataSourceId
                });

                options.success();
                return;
            }

            //  Try to find channel id if still nothing found.
            dataSourceId = this._parseIdFromUrlWithIdentifiers(url, ['/user/', '/channel/']);

            if (dataSourceId !== '') {
                var channelUploadOptions = {
                    success: function(response) {

                        this.set({
                            type: DataSourceType.YouTubePlaylist,
                            id: response.uploadsPlaylistId
                        });

                        options.success();
                        return;
                    }.bind(this)
                };

                if (this._idIsUsername()) {
                    channelUploadOptions.username = dataSourceId;
                } else {
                    channelUploadOptions.channelId = dataSourceId;
                }

                YouTubeV3API.getChannelUploadsPlaylistId(channelUploadOptions);
            } else {
                //  Callback with nothing set.
                options.success();
            }
        },

        //  These dataSourceTypes require going out to a server and collecting a list of information in order to be created.
        needsLoading: function () {
            return this.get('type') === DataSourceType.YouTubePlaylist;
        },
        
        //  Expects options: { success: function, error: function }
        getTitle: function (options) {
            //  If the title has already been fetched from the URL -- return the cached one.
            if (this.get('title') !== '') {
                options.success(this.get('title'));
                return;
            }

            YouTubeV3API.getTitle({
                serviceType: YouTubeServiceType.Playlists,
                id: this.get('id'),
                success: function (title) {
                    this.set('title', title);
                    options.success(title);
                }.bind(this),
                error: options.error
            });
        },
        
        //  TODO: I'd much rather use a series of identifiers to try and parse out a video id instead of a regex.
        //  Takes a URL and returns parsed URL information such as schema and song id if found inside of the URL.
        _parseYouTubeSongIdFromUrl: function (url) {
            var songId = '';

            var match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|watch\?.*?\&v=)([^#\&\?]*).*/);
            if (match && match[2].length === 11) {
                songId = match[2];
            }

            return songId;
        },
        
        //  Find a YouTube Channel or Playlist ID by looking through the URL for the given identifier.
        _parseIdFromUrlWithIdentifiers: function (url, identifiers) {
            var id = '';
            
            _.each(identifiers, function (identifier) {
                var urlTokens = url.split(identifier);

                if (urlTokens.length > 1) {
                    id = url.split(identifier)[1];

                    var indexOfAmpersand = id.indexOf('&');
                    if (indexOfAmpersand !== -1) {
                        id = id.substring(0, indexOfAmpersand);
                    }
                }
            });

            return id;
        },
        
        _idIsUsername: function() {
            var indexOfUser = this.get('url').indexOf('/user/');
            return indexOfUser != -1;
        }
    });

    return DataSource;
});
define('text!template/createPlaylist.html',[],function () { return '<ul class="options">\r\n    <li>\r\n        <span class="input-underline-wrapper">\r\n            <input type="text" class="playlist-title submittable bold" placeholder="<%= requiredMessage %>: <%= titleLowerCaseMessage %>" value="<%= playlistMessage %> <%= playlistCount %>" maxlength="255">\r\n            <div class="underline"></div>   \r\n        </span>\r\n    </li>\r\n    <li>\r\n        <span class="input-underline-wrapper">\r\n            <input type="text" class="youtube-source submittable bold" placeholder="<%= optionalMessage %>: <%= playlistLowerCaseMessage %> / <%= channelLowerCaseMessage %> <%= urlMessage %>">\r\n            <div class="underline"></div>   \r\n        </span>\r\n    </li>\r\n</ul>';});

define('foreground/view/createPlaylistView',[
    'common/enum/dataSourceType',
    'common/model/dataSource',
    'text!template/createPlaylist.html'
], function (DataSourceType, DataSource, CreatePlaylistTemplate) {
    'use strict';

    var Playlists = Streamus.backgroundPage.Playlists;

    var CreatePlaylistView = Backbone.Marionette.ItemView.extend({
        className: 'create-playlist',
        template: _.template(CreatePlaylistTemplate),
        
        templateHelpers: function () {
            return {
                'requiredMessage': chrome.i18n.getMessage('required'),
                'titleLowerCaseMessage': chrome.i18n.getMessage('title').toLowerCase(),
                'optionalMessage': chrome.i18n.getMessage('optional'),
                'playlistMessage': chrome.i18n.getMessage('playlist'),
                'playlistLowerCaseMessage': chrome.i18n.getMessage('playlist').toLowerCase(),
                'urlMessage': chrome.i18n.getMessage('url'),
                'channelLowerCaseMessage': chrome.i18n.getMessage('channel').toLowerCase(),
                'playlistCount': Playlists.length
            };
        },
        
        ui: {
            'playlistTitleInput': 'input.playlist-title',
            'youTubeSourceInput': 'input.youtube-source'
        },

        events: {
            'input @ui.youTubeSourceInput': '_onSourceInput',
            'input @ui.playlistTitleInput': '_validateTitle'
        },

        onRender: function () {
            this._setDataSourceAsUserInput();
        },

        onShow: function () {
            //  Reset the value after focusing to focus without selecting.
            this.ui.playlistTitleInput.focus().val(this.ui.playlistTitleInput.val());
        },

        validate: function () {
            //  If all submittable fields indicate themselves as valid -- allow submission.
            var valid = this.$el.find('.submittable.invalid').length === 0;
            return valid;
        },
        
        //  Debounce for typing support so I know when typing has finished
        _onSourceInput: _.debounce(function () {
            //  Wrap in a setTimeout to let drop event finish (no real noticeable lag but keeps things DRY easier)
            setTimeout(this._parseInput.bind(this));
        }, 100),
        
        _parseInput: function () {
            var youTubeUrl = $.trim(this.ui.youTubeSourceInput.val());
            this.ui.youTubeSourceInput.removeData('datasource').removeClass('valid invalid');

            if (youTubeUrl !== '') {
                this._setDataSourceViaUrl(youTubeUrl);
            } else {
                this._resetInputState();
            }
        },
        
        _validateTitle: function () {
            //  When the user submits - check to see if they provided a playlist name
            var playlistTitle = $.trim(this.ui.playlistTitleInput.val());
            this.ui.playlistTitleInput.toggleClass('invalid', playlistTitle === '');
        },

        _setDataSourceAsUserInput: function() {
            this.ui.youTubeSourceInput.data('datasource', new DataSource({
                type: DataSourceType.UserInput
            }));
        },

        _doRenderedOk: function () {
            var dataSource = this.ui.youTubeSourceInput.data('datasource');
            var playlistName = $.trim(this.ui.playlistTitleInput.val());

            Playlists.addPlaylistByDataSource(playlistName, dataSource);
        },
        
        _setDataSourceViaUrl: function(url) {
            //  Check validity of URL and represent validity via invalid class.
            var dataSource = new DataSource({
                url: url,
                parseVideo: false
            });

            dataSource.parseUrl({
                success: function () {
                    this._onParseUrlSuccess(dataSource);
                }.bind(this)
            });
        },
        
        _onParseUrlSuccess: function(dataSource) {
            this.ui.youTubeSourceInput.data('datasource', dataSource);

            dataSource.getTitle({
                success: this._onGetTitleSuccess.bind(this),
                error: this._onGetTitleError.bind(this)
            });
        },
        
        _onGetTitleSuccess: function(title) {
            this.ui.playlistTitleInput.val(title);
            this._validateTitle();
            this.ui.youTubeSourceInput.addClass('valid');
        },
        
        _onGetTitleError: function() {
            var originalValue = this.ui.playlistTitleInput.val();
            this.ui.playlistTitleInput.data('original-value', originalValue).val(chrome.i18n.getMessage('errorRetrievingTitle'));
            this.ui.youTubeSourceInput.addClass('invalid');
        },
        
        _resetInputState: function() {
            this.ui.youTubeSourceInput.removeClass('invalid valid');
            this.ui.playlistTitleInput.val(this.ui.playlistTitleInput.data('original-value'));
            this._setDataSourceAsUserInput();
        }
    });

    return CreatePlaylistView;
});
define('text!template/deletePlaylist.html',[],function () { return '<%= areYouSureYouWantToDeletePlaylistMessage %> <strong><%= title %></strong>?\r\n        \r\n<div class="reminder">\r\n    <label>\r\n        <input type="checkbox">\r\n        <%= dontRemindMeAgainMessage %>\r\n    </label>\r\n</div>';});

define('foreground/view/deletePlaylistView',[
    'text!template/deletePlaylist.html'
], function (DeletePlaylistTemplate) {
    'use strict';

    var Settings = Streamus.backgroundPage.Settings;

    var DeletePlaylistView = Backbone.Marionette.ItemView.extend({
        className: 'delete-playlist',
        template: _.template(DeletePlaylistTemplate),
        
        ui: {
            reminderCheckbox: '.reminder input[type="checkbox"]'
        },
        
        templateHelpers: {
            areYouSureYouWantToDeletePlaylistMessage: chrome.i18n.getMessage('areYouSureYouWantToDeletePlaylist'),
            dontRemindMeAgainMessage: chrome.i18n.getMessage('dontRemindMeAgain')
        },
        
        doOk: function() {
            this.model.destroy();
        },
        
        _doRenderedOk: function () {
            var remindDeletePlaylist = !this.ui.reminderCheckbox.is(':checked');
            Settings.set('remindDeletePlaylist', remindDeletePlaylist);

            this.doOk();
        }
    });

    return DeletePlaylistView;
});
define('foreground/view/prompt/deletePlaylistPromptView',[
    'foreground/model/genericPrompt',
    'foreground/view/deletePlaylistView',
    'foreground/view/prompt/genericPromptView'
], function (GenericPrompt, DeletePlaylistView, GenericPromptView) {
    'use strict';
    
    var Settings = Streamus.backgroundPage.Settings;
    
    var DeletePlaylistPromptView = GenericPromptView.extend({
        initialize: function (options) {
            this.model = new GenericPrompt({
                title: chrome.i18n.getMessage('deletePlaylist'),
                okButtonText: chrome.i18n.getMessage('delete'),
                view: new DeletePlaylistView({
                    model: options.playlist
                })
            });

            GenericPromptView.prototype.initialize.apply(this, arguments);
        },
        
        reminderDisabled: function() {
            return !Settings.get('remindDeletePlaylist');
        }
    });

    return DeletePlaylistPromptView;
});
define('text!template/editPlaylist.html',[],function () { return '<ul class="options">\r\n    <li>\r\n        <span class="input-underline-wrapper">\r\n            <input type="text" class="playlist-title submittable bold" placeholder="<%= requiredMessage %>: <%= titleMessage %>" value="<%= title %>">\r\n            <div class="underline"></div>   \r\n        </span>\r\n    </li>\r\n</ul>';});

define('foreground/view/editPlaylistView',[
    'text!template/editPlaylist.html'
], function (EditPlaylistTemplate) {
    'use strict';

    var EditPlaylistView = Backbone.Marionette.ItemView.extend({
        className: 'edit-playlist',
        template: _.template(EditPlaylistTemplate),
        
        templateHelpers: {
            requiredMessage: chrome.i18n.getMessage('required'),
            titleMessage: chrome.i18n.getMessage('title').toLowerCase()
        },
        
        ui: {
            playlistTitle: 'input[type="text"]'
        },

        events: {
            'input.playlist-title': '_validateTitle'
        },
        
        onShow: function () {
            //  Reset val to prevent highlighting and just focus.
            this.ui.playlistTitle.focus().val(this.ui.playlistTitle.val());
        },
        
        validate: function () {
            var valid = this.$el.find('.submittable.invalid').length === 0;
            return valid;
        },
        
        _validateTitle: function () {
            //  When the user submits - check to see if they provided a playlist name
            var playlistTitle = $.trim(this.ui.playlistTitle.val());
            this.ui.playlistTitle.toggleClass('invalid', playlistTitle === '');
        },
        
        _doRenderedOk: function () {
            var playlistTitle = $.trim(this.ui.playlistTitle.val());
            this.model.set('title', playlistTitle);
        }
    });

    return EditPlaylistView;
});
define('foreground/view/prompt/editPlaylistPromptView',[
    'foreground/model/genericPrompt',
    'foreground/view/editPlaylistView',
    'foreground/view/prompt/genericPromptView'
], function (GenericPrompt, EditPlaylistView, GenericPromptView) {
    'use strict';
    
    var EditPlaylistPromptView = GenericPromptView.extend({
        initialize: function (options) {
            this.model = new GenericPrompt({
                title: chrome.i18n.getMessage('editPlaylist'),
                okButtonText: chrome.i18n.getMessage('update'),
                view: new EditPlaylistView({
                    model: options.playlist
                })
            });
            
            GenericPromptView.prototype.initialize.apply(this, arguments);
        }
    });

    return EditPlaylistPromptView;
});
define('foreground/model/exportPlaylist',[
], function () {
    'use strict';

    var ExportPlaylist = Backbone.Model.extend({
        localStorage: new Backbone.LocalStorage('ExportPlaylist'),

        defaults: {
            //  Need to set the ID for Backbone.LocalStorage
            id: 'ExportPlaylist',
            playlist: null,
            exportCsv: true,
            exportJson: false,
            exportTitle: true,
            exportId: true,
            exportUrl: false,
            exportAuthor: false,
            exportDuration: false
        },
        
        //  Don't want to save the playlist to localStorage -- only the configuration variables
        blacklist: ['playlist'],
        toJSON: function () {
            return _.omit(this.attributes, this.blacklist);
        },
        
        initialize: function () {
            //  Load from Backbone.LocalStorage
            this.fetch();
        }
    });

    return ExportPlaylist;
});
define('text!template/exportPlaylist.html',[],function () { return '<div class="topic-group">\r\n    <div class="topic">File type</div>\r\n    <div class="category">\r\n        <ul>\r\n            <li>\r\n                <label>\r\n                    <input id="export-csv-radio" data-model-attribute="exportCsv" type="radio" name="export-type" value="csv" <%= exportCsv ? \'checked\' : \'\' %> />\r\n                    CSV\r\n                </label>\r\n            </li>\r\n            <li>\r\n                <label>\r\n                    <input id="export-json-radio" data-model-attribute="exportJson" type="radio" name="export-type" value="json"  <%= exportJson ? \'checked\' : \'\' %> />\r\n                    JSON\r\n                </label>\r\n            </li>\r\n        </ul>\r\n    </div>\r\n</div>\r\n\r\n<div class="topic-group">\r\n    <div class="topic">Include</div>\r\n    <div class="category">\r\n        <ul>\r\n            <li>\r\n                <label>\r\n                    <input id="export-title-checkbox" data-model-attribute="exportTitle" type="checkbox" <%= exportTitle ? \'checked\' : \'\' %> />\r\n                    Title\r\n                </label>\r\n            </li>\r\n            <li>\r\n                <label>\r\n                    <input id="export-id-checkbox" data-model-attribute="exportId" type="checkbox" <%= exportId ? \'checked\' : \'\' %> />\r\n                    ID\r\n                </label>\r\n            </li>\r\n            <li>\r\n                <label>\r\n                    <input id="export-url-checkbox" data-model-attribute="exportUrl" type="checkbox"  <%= exportUrl ? \'checked\' : \'\' %> />\r\n                    URL\r\n                </label>\r\n            </li>\r\n            <li>\r\n                <label>\r\n                    <input id="export-author-checkbox" data-model-attribute="exportAuthor" type="checkbox" <%= exportAuthor ? \'checked\' : \'\' %> />\r\n                    Author\r\n                </label>\r\n            </li>\r\n            <li>\r\n                <label>\r\n                    <input id="export-duration-checkbox" data-model-attribute="exportDuration" type="checkbox" <%= exportDuration ? \'checked\' : \'\' %> />\r\n                    Duration\r\n                </label>\r\n            </li>\r\n        </ul>\r\n    </div>\r\n</div>';});

define('foreground/view/exportPlaylistView',[
    'common/model/utility',
    'text!template/exportPlaylist.html'
], function (Utility, ExportPlaylistTemplate) {
    'use strict';

    var ExportPlaylistView = Backbone.Marionette.ItemView.extend({
        className: 'export-playlist',
        template: _.template(ExportPlaylistTemplate),
        
        ui: {
            exportCsvRadio: '#export-csv-radio',
            exportJsonRadio: '#export-json-radio',
            exportTitleCheckbox: '#export-title-checkbox',
            exportIdCheckbox: '#export-id-checkbox',
            exportUrlCheckbox: '#export-url-checkbox',
            exportAuthorCheckbox: '#export-author-checkbox',
            exportDurationCheckbox: '#export-duration-checkbox',
            checkboxes: 'input[type=checkbox]',
            radios: 'input[type=radio]'
        },
        
        _doRenderedOk: function () {
            this._exportPlaylist();
            this._saveState();
        },
        
        //  Ensure at least one checkbox is checked
        _validateCheckboxes: function () {
            var valid = this._isAnyCheckboxChecked();
            return valid;
        },
        
        _exportPlaylist: function() {
            var downloadableElement = document.createElement('a');
            downloadableElement.setAttribute('href', 'data:' + this._getMimeType() + ';charset=utf-8,' + encodeURIComponent(this._getFileText()));
            downloadableElement.setAttribute('download', this._getFileName());
            downloadableElement.click();
        },
        
        _getFileText: function() {
            var fileText;

            var itemsToExport = this.model.get('playlist').get('items').map(this._mapAsExportedItem.bind(this));
            var json = JSON.stringify(itemsToExport);
            
            if (this._isExportingAsCsv()) {
                fileText = Utility.jsonToCsv(json);
            } else {
                fileText = json;
            }

            return fileText;
        },
        
        _mapAsExportedItem: function(item) {
            var exportedItem = {};
            var song = item.get('song');

            if (this._isTitleCheckboxChecked()) {
                exportedItem.title = song.get('title');
            }
            
            if (this._isIdCheckboxChecked()) {
                exportedItem.id = song.get('id');
            }
            
            if (this._isUrlCheckboxChecked()) {
                exportedItem.url = song.get('url');
            }
            
            if (this._isAuthorCheckboxChecked()) {
                exportedItem.author = song.get('author');
            }
            
            if (this._isDurationCheckboxChecked()) {
                //  Getting normal duration isn't very useful b/c it's all in seconds rather than human readable.
                exportedItem.duration = song.get('prettyDuration');
            }

            return exportedItem;
        },
        
        _getFileName: function() {
            var fileExtension = '.txt';
            
            if (this._isExportingAsJson()) {
                fileExtension = '.json';
            }

            return this.model.get('playlist').get('title') + fileExtension;
        },
        
        _getMimeType: function () {
            var mimeType = 'text/plain';
            
            if (this._isExportingAsJson()) {
                mimeType = 'application/json';
            }

            return mimeType;
        },
        
        _isAnyCheckboxChecked: function() {
            return this.ui.checkboxes.is(':checked');
        },
        
        _isTitleCheckboxChecked: function() {
            return this.ui.exportTitleCheckbox.is(':checked');
        },
        
        _isIdCheckboxChecked: function() {
            return this.ui.exportIdCheckbox.is(':checked');
        },
        
        _isUrlCheckboxChecked: function() {
            return this.ui.exportUrlCheckbox.is(':checked');
        },
        
        _isAuthorCheckboxChecked: function() {
            return this.ui.exportAuthorCheckbox.is(':checked');
        },
        
        _isDurationCheckboxChecked: function() {
            return this.ui.exportDurationCheckbox.is(':checked');
        },
        
        _isExportingAsJson: function() {
            return this.ui.exportJsonRadio.is(':checked');
        },
        
        _isExportingAsCsv: function() {
            return this.ui.exportCsvRadio.is(':checked');
        },
        
        //  Write the checked state of all radios and checkboxes to the model for saving to localStorage.
        _saveState: function () {
            var inputs = this.ui.checkboxes.add(this.ui.radios);
            var saveOptions = {};

            _.each(inputs, function (input) {
                var modelAttribute = $(input).data('model-attribute');
                saveOptions[modelAttribute] = input.checked;
            });

            this.model.save(saveOptions);
        }
    });

    return ExportPlaylistView;
});
define('foreground/view/prompt/exportPlaylistPromptView',[
    'foreground/model/exportPlaylist',
    'foreground/model/genericPrompt',
    'foreground/view/exportPlaylistView',
    'foreground/view/prompt/genericPromptView'
], function (ExportPlaylist, GenericPrompt, ExportPlaylistView, GenericPromptView) {
    'use strict';
    
    var ExportPlaylistPromptView = GenericPromptView.extend({
        initialize: function (options) {
            this.model = new GenericPrompt({
                title: chrome.i18n.getMessage('exportPlaylist'),
                okButtonText: chrome.i18n.getMessage('export'),
                view: new ExportPlaylistView({
                    model: new ExportPlaylist({
                        playlist: options.playlist
                    })
                })
            });

            GenericPromptView.prototype.initialize.apply(this, arguments);
        }
    });

    return ExportPlaylistPromptView;
});
define('text!template/playlist.html',[],function () { return '<i class="fa fa-list fa-fw"></i>\r\n<i class="play fa fa-play colored clickable tooltipable"></i>\r\n\r\n<div class="spinner small"></div>\r\n\r\n<div class="title text-tooltipable" title="<%= title %>">\r\n    <%= title %>\r\n</div>\r\n\r\n<span class="count"><%= items.length %></span>';});

define('foreground/view/leftCoveringPane/playlistView',[
    'common/enum/listItemType',
    'foreground/collection/contextMenuItems',
    'foreground/model/contextMenuActions',
    'foreground/view/behavior/tooltip',
    'foreground/view/prompt/deletePlaylistPromptView',
    'foreground/view/prompt/editPlaylistPromptView',
    'foreground/view/prompt/exportPlaylistPromptView',
    'text!template/playlist.html'
], function (ListItemType, ContextMenuItems, ContextMenuActions, Tooltip, DeletePlaylistPromptView, EditPlaylistPromptView, ExportPlaylistPromptView, PlaylistTemplate) {
    'use strict';

    var Playlists = Streamus.backgroundPage.Playlists;
    var StreamItems = Streamus.backgroundPage.StreamItems;

    var PlaylistView = Backbone.Marionette.ItemView.extend({
        tagName: 'li',
        className: 'list-item playlist small',
        template: _.template(PlaylistTemplate),

        attributes: function () {
            return {
                'data-id': this.model.get('id'),
                'data-type': ListItemType.Playlist
            };
        },
        
        events: {
            'click': '_onClick',
            'click @ui.playButton:not(.disabled)': '_play',
            'contextmenu': '_showContextMenu',
            'dblclick': '_onDblClick'
        },
        
        modelEvents: {
            'change:title': '_updateTitle',
            'change:dataSourceLoaded': '_setLoadingClass',
            'change:active': '_setActiveClass'
        },
        
        ui: {
            itemCount: '.count',
            title: '.title',
            playButton: '.play'
        },
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },
        
        initialize: function () {
            this.listenTo(this.model.get('items'), 'add remove reset', this._onItemCountChanged);
        },
        
        onRender: function () {
            this._setLoadingClass();
            this._setActiveClass();
            this._setPlayButtonState();
        },
        
        _updateTitle: function () {
            var title = this.model.get('title');
            this.ui.title.text(title).attr('title', title);
            this._setPlayButtonTitle();
        },
        
        _setLoadingClass: function () {
            var loading = this.model.has('dataSource') && !this.model.get('dataSourceLoaded');
            this.$el.toggleClass('loading', loading);
        },
        
        _setActiveClass: function () {
            var active = this.model.get('active');
            this.$el.toggleClass('active', active);
        },
        
        _onItemCountChanged: function() {
            this._updateItemCount();
            this._setPlayButtonState();
        },
        
        //  Disable the play button when there are no items in the playlist since the button can't do anything.
        _setPlayButtonState: function () {
            var itemCount = this.model.get('items').length;
            this.ui.playButton.toggleClass('disabled', itemCount === 0);
            this._setPlayButtonTitle();
        },
        
        _setPlayButtonTitle: function() {
            var isEmpty = this.model.get('items').length === 0;
            
            //  TODO: i18n
            var title = isEmpty ? chrome.i18n.getMessage('playlistEmpty') : 'Play ' + this.model.get('title');
            this.ui.playButton.attr('title', title);
        },
        
        _updateItemCount: function () {
            var itemCount = this.model.get('items').length;
            this.ui.itemCount.text(itemCount);
        },
        
        _activate: function () {
            this.model.set('active', true);
        },
        
        _showContextMenu: function (event) {
            event.preventDefault();
            
            var isEmpty = this.model.get('items').length === 0;

            //  Don't allow deleting of the last playlist.
            var isDeleteDisabled = Playlists.length === 1;

            ContextMenuItems.reset([{
                    //  No point in sharing an empty playlist.
                    disabled: isEmpty,
                    title: isEmpty ? chrome.i18n.getMessage('playlistEmpty') : '',
                    text: chrome.i18n.getMessage('copyUrl'),
                    onClick: this._copyPlaylistUrl.bind(this)
                }, {
                    text: chrome.i18n.getMessage('delete'),
                    disabled: isDeleteDisabled,
                    title: isDeleteDisabled ? chrome.i18n.getMessage('cantDeleteLastPlaylist') : '',
                    onClick: this._showDeletePlaylistPrompt.bind(this)
                }, {
                    text: chrome.i18n.getMessage('add'),
                    disabled: isEmpty,
                    title: isEmpty ? chrome.i18n.getMessage('playlistEmpty') : '',
                    onClick: this._addSongsToStream.bind(this)
                }, {
                    text: chrome.i18n.getMessage('edit'),
                    onClick: this._showEditPlaylistPrompt.bind(this)
                }, {
                    //  No point in exporting an empty playlist.
                    disabled: isEmpty,
                    title: isEmpty ? chrome.i18n.getMessage('playlistEmpty') : '',
                    text: chrome.i18n.getMessage('export'),
                    onClick: this._showExportPlaylistPrompt.bind(this)
                }]
            );
        },
        
        _copyPlaylistUrl: function() {
            this.model.getShareCode(function (shareCode) {
                var shareCodeShortId = shareCode.get('shortId');
                var urlFriendlyEntityTitle = shareCode.get('urlFriendlyEntityTitle');
                var playlistShareUrl = 'http://share.streamus.com/playlist/' + shareCodeShortId + '/' + urlFriendlyEntityTitle;

                chrome.extension.sendMessage({
                    method: 'copy',
                    text: playlistShareUrl
                });
            });
        },
        
        _showEditPlaylistPrompt: function() {
            Backbone.Wreqr.radio.channel('prompt').vent.trigger('show', EditPlaylistPromptView, {
                playlist: this.model
            });
        },
        
        _showDeletePlaylistPrompt: function() {
            //  No need to notify if the playlist is empty.
            if (this.model.get('items').length === 0) {
                this.model.destroy();
            } else {
                Backbone.Wreqr.radio.channel('prompt').vent.trigger('show', DeletePlaylistPromptView, {
                    playlist: this.model
                });
            }
        },
        
        _showExportPlaylistPrompt: function() {
            Backbone.Wreqr.radio.channel('prompt').vent.trigger('show', ExportPlaylistPromptView, {
                playlist: this.model
            });
        },
        
        _addSongsToStream: function () {
            ContextMenuActions.addSongsToStream(this.model.get('items').pluck('song'));
        },
        
        _onClick: function () {
            this._activate();
        },
        
        _onDblClick: function () {
            this._activate();
        },
        
        _play: function () {
            //  TODO: I think this should actually go through Radio Channel and just tell StreamItems to play songs.
            StreamItems.addSongs(this.model.get('items').pluck('song'), {
                playOnAdd: true
            });
        }
    });

    return PlaylistView;
});
define('foreground/view/prompt/createPlaylistPromptView',[
    'foreground/model/genericPrompt',
    'foreground/view/createPlaylistView',
    'foreground/view/prompt/genericPromptView'
], function (GenericPrompt, CreatePlaylistView, GenericPromptView) {
    'use strict';
    
    var CreatePlaylistPromptView = GenericPromptView.extend({
        initialize: function() {
            this.model = new GenericPrompt({
                title: chrome.i18n.getMessage('createPlaylist'),
                okButtonText: chrome.i18n.getMessage('create'),
                view: new CreatePlaylistView()
            });
            
            GenericPromptView.prototype.initialize.apply(this, arguments);
        }
    });

    return CreatePlaylistPromptView;
});
define('text!template/playlistsArea.html',[],function () { return '<div class="panel flex-column">\r\n    <div class="header">\r\n        <button class="button-icon hide enabled tooltipable">\r\n            <i class="fa fa-reorder"></i>\r\n        </button>\r\n    </div>\r\n    <div class="divider"></div>\r\n    <div class="list">\r\n        <div class="list-header">\r\n            <%= playlists %>\r\n        </div>\r\n        \r\n        <ul class="playlists">\r\n        </ul>\r\n    </div>\r\n    <div class="context-buttons">\r\n        <div class="pull-right">\r\n            <button class="button-icon button-small add tooltipable" title="<%= createPlaylist %>">\r\n                <i class="fa fa-plus"></i>\r\n            </button>\r\n\r\n            <button class="button-icon button-small edit tooltipable" title="<%= editPlaylist %>">\r\n                <i class="fa fa-pencil"></i>\r\n            </button>\r\n            \r\n            <!--title is set in view because icon can be disabled-->\r\n            <button id="delete-playlist-button" class="button-icon button-small delete tooltipable">\r\n                <i class="fa fa-trash-o"></i>\r\n            </button>\r\n        </div>\r\n    </div>\r\n</div>';});

define('foreground/view/leftCoveringPane/playlistsAreaView',[
    'common/enum/listItemType',
    'foreground/view/createPlaylistView',
    'foreground/view/behavior/tooltip',
    'foreground/view/leftCoveringPane/playlistView',
    'foreground/view/prompt/createPlaylistPromptView',
    'foreground/view/prompt/deletePlaylistPromptView',
    'foreground/view/prompt/editPlaylistPromptView',
    'text!template/playlistsArea.html'
], function (ListItemType, CreatePlaylistView, Tooltip, PlaylistView, CreatePlaylistPromptView, DeletePlaylistPromptView, EditPlaylistPromptView, PlaylistsAreaTemplate) {
    'use strict';

    var SignInManager = Streamus.backgroundPage.SignInManager;

    var PlaylistsAreaView = Backbone.Marionette.CompositeView.extend({
        className: 'playlists-area fixed-full-overlay',
        template: _.template(PlaylistsAreaTemplate),
        childView: PlaylistView,
        childViewContainer: '@ui.childContainer',
        
        //  Overwrite resortView to only render children as expected
        resortView: function () {
            this._renderChildren();
        },

        events: {
            'click': '_hideIfClickOutsidePanel',
            'click @ui.hideButton': '_hide',
            'click @ui.addButton': '_showCreatePlaylistPrompt',
            'click @ui.editButton': '_showEditActivePlaylistPrompt',
            'click @ui.deleteButton:not(.disabled)': '_showDeleteActivePlaylistPrompt',
            'dblclick @ui.childContainer': '_onDblClickChildContainer'
        },
        
        collectionEvents: {
            'add remove reset': '_setDeleteButtonState'
        },
        
        ui: {
            buttons: '.button-icon',
            panel: '.panel',
            childContainer: '.playlists',
            contextButtons: '.context-buttons',
            deleteButton: '#delete-playlist-button',
            addButton: '.add',
            hideButton: '.hide',
            editButton: '.edit',
            textTooltipable: '.text-tooltipable'
        },
        
        templateHelpers: {
            playlists: chrome.i18n.getMessage('playlists'),
            createPlaylist: chrome.i18n.getMessage('createPlaylist'),
            editPlaylist: chrome.i18n.getMessage('editPlaylist')
        },
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },

        initialize: function () {
            //  Don't show playlist actions if SignInManager isn't signedIn because won't be able to save reliably.
            this.listenTo(SignInManager, 'change:signedIn', this._toggleContextButtons);
        },

        onRender: function () {
            this.ui.childContainer.sortable(this._getSortableOptions());

            this._toggleContextButtons();
            this._setDeleteButtonState();
        },
        
        onShow: function () {
            //  Store original values in data attribute to be able to revert without magic numbers.
            this.$el.data('background', this.$el.css('background')).transition({
                'background': 'rgba(0, 0, 0, 0.5)'
            }, 'snap');

            this.ui.panel.transition({
                x: this.ui.panel.width()
            }, 300, 'snap');
        },
        
        //  If the user clicks the 'dark' area outside the panel -- hide the panel.
        _hideIfClickOutsidePanel: function (event) {
            if (event.target == event.currentTarget) {
                this._hide();
            }
        },
        
        _hide: function () {
            this.$el.transition({
                'background': this.$el.data('background')
            });

            this.ui.panel.transition({
                x: -20
            }, 300, this.destroy.bind(this));
        },
        
        _getSortableOptions: function () {
            var sortableOptions = {
                axis: 'y',
                placeholder: 'sortable-placeholder list-item',
                delay: 100,
                containment: 'parent',
                update: this._onSortableUpdate.bind(this)
            };

            return sortableOptions;
        },
        
        //  Whenever a playlist is moved visually -- update corresponding model with new information.
        _onSortableUpdate: function (event, ui) {
            var listItemType = ui.item.data('type');

            //  Run this code only when reorganizing playlists.
            if (listItemType === ListItemType.Playlist) {
                var playlistId = ui.item.data('id');
                var index = ui.item.index();

                var playlist = this.collection.get(playlistId);
                var originalIndex = this.collection.indexOf(playlist);

                //  When moving a playlist down - all the items shift up one which causes an off-by-one error when calling
                //  moveToIndex. Account for this by adding 1 to the index when moving down, but not when moving up since no shift happens.
                if (originalIndex < index) {
                    index += 1;
                }

                this.collection.moveToIndex(playlistId, index);
            }
        },
        
        _showCreatePlaylistPrompt: function () {
            Backbone.Wreqr.radio.channel('prompt').vent.trigger('show', CreatePlaylistPromptView);
        },
        
        _showEditActivePlaylistPrompt: function () {
            Backbone.Wreqr.radio.channel('prompt').vent.trigger('show', EditPlaylistPromptView, {
                playlist: this.collection.getActivePlaylist()
            });
        },
        
        _toggleContextButtons: function () {
            this.ui.contextButtons.toggle(SignInManager.get('signedIn'));
        },
        
        _setDeleteButtonState: function () {
            //  Can't delete the last playlist:
            var canDelete = this.collection.canDelete();

            var title;
            if (canDelete) {
                title = chrome.i18n.getMessage('deletePlaylist');
            } else {
                title = chrome.i18n.getMessage('cantDeleteLastPlaylist');
            }

            this.ui.deleteButton.toggleClass('disabled', !canDelete).attr('title', title);
        },
        
        _showDeleteActivePlaylistPrompt: function () {
            var activePlaylist = this.collection.getActivePlaylist();
            var isEmpty = activePlaylist.get('items').length === 0;

            //  No need to notify if the playlist is empty.
            if (isEmpty) {
                activePlaylist.destroy();
            } else {
                Backbone.Wreqr.radio.channel('prompt').vent.trigger('show', DeletePlaylistPromptView, {
                    playlist: activePlaylist
                });
            }
        },
        
        //  Whenever a child is double-clicked it will become active and the menu should hide itself.
        _onDblClickChildContainer: function () {
            this._hide();
        }
    });

    return PlaylistsAreaView;
});
define('text!template/search.html',[],function () { return '<div class="top-bar table">\r\n    <div class="search-bar">\r\n        <span class="input-underline-wrapper">\r\n            <input placeholder="<%= searchMessage %>..." type="text" value="<%= query %>">\r\n            <div class="underline"></div>   \r\n        </span>\r\n    </div>\r\n    \r\n    <button class="button-icon remove tooltipable hide-search" title="<%= hideSearchMessage %>">\r\n        <i class="fa fa-times"></i>\r\n    </button>\r\n</div>\r\n\r\n<div class="divider"></div>\r\n\r\n<div class="big-text-wrapper full flex-column">\r\n    <div class="big-text instructions">\r\n        <div class="header"><%= startTypingMessage %></div>\r\n        <%= resultsWillAppearAsYouSearchMessage %>.\r\n    </div>\r\n\r\n    <div class="big-text searching hidden">\r\n        <div class="header"><%= searchingMessage %>...</div>\r\n        <div class="spinner medium text-center"></div>\r\n    </div>\r\n\r\n    <div class="big-text no-results hidden">\r\n        <div class="header"><%= noResultsFoundMessage %></div>\r\n        <%= sorryAboutThatMessage %>. <%= trySearchingForSomethingElseMessage %>.\r\n    </div>\r\n    \r\n    <div class="list">\r\n        <div id="search-results"></div>\r\n    </div>\r\n</div>\r\n\r\n<div class="bottom-menubar">\r\n    <div class="playlist-actions pull-right">\r\n        <button id="play-selected" class="button-label tooltipable" title="<%= playSelectedMessage %>">\r\n            <i class="fa fa-play"></i>\r\n            <%= playSelectedMessage %>\r\n        </button>\r\n        \r\n        <button id="add-selected" class="button-label tooltipable" title="<%= addSelectedMessage %>">\r\n            <i class="fa fa-plus"></i>\r\n            <%= addSelectedMessage %>\r\n        </button>\r\n\r\n        <button id="save-selected" class="button-label tooltipable" title="<%= saveSelectedMessage %>">\r\n            <i class="fa fa-save"></i>\r\n            <%= saveSelectedMessage %>\r\n        </button>\r\n    </div>\r\n</div>';});

define('foreground/view/leftCoveringPane/searchView',[
    'common/enum/listItemType',
    'foreground/view/behavior/multiSelect',
    'foreground/view/behavior/slidingRender',
    'foreground/view/behavior/sortable',
    'foreground/view/behavior/tooltip',
    'foreground/view/leftCoveringPane/searchResultView',
    'foreground/view/prompt/saveSongsPromptView',
    'text!template/search.html'
], function (ListItemType, MultiSelect, SlidingRender, Sortable, Tooltip, SearchResultView, SaveSongsPromptView, SearchTemplate) {
    'use strict';

    var StreamItems = Streamus.backgroundPage.StreamItems;
    var SignInManager = Streamus.backgroundPage.SignInManager;
    
    var SearchView = Backbone.Marionette.CompositeView.extend({
        id: 'search',
        className: 'left-pane full flex-column',
        template: _.template(SearchTemplate),
        childViewContainer: '@ui.childContainer',
        childView: SearchResultView,
        
        //  Overwrite resortView to only render children as expected
        resortView: function () {
            this._renderChildren();
        },
        
        childViewOptions: {
            type: ListItemType.SearchResult
        },
        
        ui: {
            bottomMenubar: '.bottom-menubar',
            searchInput: '.search-bar input',
            searchingMessage: '.searching',
            instructions: '.instructions',
            noResultsMessage: '.no-results',
            bigTextWrapper: '.big-text-wrapper',
            childContainer: '#search-results',
            saveSelectedButton: '#save-selected',
            hideSearchButton: '.hide-search',
            playSelectedButton: '#play-selected',
            addSelectedButton: '#add-selected'
        },
        
        events: {
            'input @ui.searchInput': '_search',
            'click @ui.hideSearchButton': '_hide',
            'contextmenu @ui.childContainer': '_showContextMenu',
            'click @ui.playSelectedButton': '_playSelected',
            'click @ui.addSelectedButton': '_addSelected',
            'click @ui.saveSelectedButton': '_showSaveSelectedPrompt'
        },
        
        modelEvents: {
            'change:query change:searching': '_toggleBigText'
        },

        collectionEvents: {
            'reset': '_toggleBigText',
            'change:selected': '_toggleBottomMenubar'
        },
 
        templateHelpers: function() {
            return {
                saveSelectedMessage: chrome.i18n.getMessage('saveSelected'),
                addSelectedMessage: chrome.i18n.getMessage('addSelected'),
                playSelectedMessage: chrome.i18n.getMessage('playSelected'),
                searchMessage: chrome.i18n.getMessage('search'),
                hideSearchMessage: chrome.i18n.getMessage('hideSearch'),
                startTypingMessage: chrome.i18n.getMessage('startTyping'),
                resultsWillAppearAsYouSearchMessage: chrome.i18n.getMessage('resultsWillAppearAsYouSearch'),
                searchingMessage: chrome.i18n.getMessage('searching'),
                noResultsFoundMessage: chrome.i18n.getMessage('noResultsFound'),
                sorryAboutThatMessage: chrome.i18n.getMessage('sorryAboutThat'),
                trySearchingForSomethingElseMessage: chrome.i18n.getMessage('trySearchingForSomethingElse'),
                cantSaveNotSignedInMessage: chrome.i18n.getMessage('cantSaveNotSignedIn')
            };
        },
        
        behaviors: function() {
            return {
                MultiSelect: {
                    behaviorClass: MultiSelect
                },
                SlidingRender: {
                    behaviorClass: SlidingRender
                },
                Sortable: {
                    behaviorClass: Sortable
                },
                Tooltip: {
                    behaviorClass: Tooltip
                }
            };
        },
        
        initialize: function () {
            this.listenTo(SignInManager, 'change:signedIn', this._toggleSaveSelected);
        },
 
        onRender: function () {
            this._toggleBigText();
            this._toggleBottomMenubar();
            this._toggleSaveSelected();
        },
        
        onShow: function () {
            this.model.stopClearQueryTimer();
            
            //  Reset val after focusing to prevent selecting the text while maintaining focus.
            this.ui.searchInput.focus().val(this.ui.searchInput.val());

            //  By passing undefined in I opt to use the default duration length.
            var transitionDuration = this.options.doSnapAnimation ? undefined : 0;

            this.$el.transition({
                x: this.$el.width()
            }, transitionDuration, 'snap');
        },

        onDestroy: function () {
            //  Remember search query for a bit just in case user close/re-open quickly, no need to re-search.
            this.model.startClearQueryTimer();
        },
        
        //  Shake the view to bring attention to the fact that the view is already visible.
        //  Throttled so that the animations can't stack up if shake is spammed.
        shake: _.throttle(function() {
            this.$el.effect('shake', {
                distance: 3,
                times: 3
            });
        }, 500),
        
        _hide: function () {
            //  Transition the view back out before closing.
            this.$el.transition({
                //  Transition -20px off the screen to account for the shadow on the view.
                x: -20
            }, this.destroy.bind(this));
        },
        
        //  Searches youtube for song results based on the given text.
        _search: function () {
            var query = this.ui.searchInput.val();
            this.model.set('query', query);
        },
        
        _toggleSaveSelected: function () {
            var signedIn = SignInManager.get('signedIn');
            this.ui.saveSelectedButton.toggleClass('disabled', !signedIn);

            var templateHelpers = this.templateHelpers();
            this.ui.saveSelectedButton.attr('title', signedIn ? templateHelpers.saveSelectedMessage : templateHelpers.cantSaveNotSignedInMessage);
        },
        
        _toggleBottomMenubar: function () {
            var selectedCount = this.collection.selected().length;
            this.ui.bottomMenubar.toggle(selectedCount > 0);

            //  Need to update viewportHeight in slidingRender behavior:
            this.triggerMethod('ListHeightUpdated');
        },

        //  Set the visibility of any visible text messages.
        _toggleBigText: function () {
            //  Hide the search message when there is no search in progress.
            var searching = this.model.get('searching');
            this.ui.searchingMessage.toggleClass('hidden', !searching);
    
            //  Hide the instructions message once user has typed something.
            var hasSearchQuery = this.model.hasQuery();
            this.ui.instructions.toggleClass('hidden', hasSearchQuery);

            //  Only show no results when all other options are exhausted and user has interacted.
            var hasSearchResults = this.collection.length > 0;
            var hideNoResults = hasSearchResults || searching || !hasSearchQuery;
            this.ui.noResultsMessage.toggleClass('hidden', hideNoResults);
        },
        
        _playSelected: function () {
            StreamItems.addSongs(this.collection.getSelectedSongs(), {
                playOnAdd: true
            });
        },
        
        _addSelected: function() {
            StreamItems.addSongs(this.collection.getSelectedSongs());
        },

        _showSaveSelectedPrompt: function () {
            var disabled = this.ui.saveSelectedButton.hasClass('disabled');
            
            if (!disabled) {
                Backbone.Wreqr.radio.channel('prompt').vent.trigger('show', SaveSongsPromptView, {
                    songs: this.collection.getSelectedSongs()
                });
            }
            //  Don't close the menu if disabled
            return !disabled;
        }
    });

    return SearchView;
});
define('foreground/view/leftCoveringPane/leftCoveringPaneRegion',[
    'foreground/view/leftCoveringPane/playlistsAreaView',
    'foreground/view/leftCoveringPane/searchView'
], function (PlaylistsAreaView, SearchView) {
    'use strict';
    
    var Search = Streamus.backgroundPage.Search;
    var Settings = Streamus.backgroundPage.Settings;
    var Playlists = Streamus.backgroundPage.Playlists;

    var LeftCoveringPaneRegion = Backbone.Marionette.Region.extend({
        //  TODO: I am required to use ID selector here until bug resolved: https://github.com/marionettejs/backbone.marionette/issues/1530
        el: '#left-covering-pane-region',
        
        initialize: function () {
            this.listenTo(Backbone.Wreqr.radio.channel('global').vent, 'showSearch', this._showSearchView);
            this.listenTo(Backbone.Wreqr.radio.channel('global').vent, 'showPlaylistsArea', this._showPlaylistsAreaView);
            
            if (Settings.get('alwaysOpenToSearch')) {
                this._showSearchView(false);
            }
        },

        _showSearchView: function (doSnapAnimation) {
            this._searchViewExists() ? this._shakeSearchView() : this._createSearchView(doSnapAnimation);
        },
        
        _showPlaylistsAreaView: function () {
            if (!this._playlistsAreaViewExists()) {
                this._createPlaylistsAreaView();
            }
        },
        
        //  Returns true if SearchView is currently shown
        _searchViewExists: function () {
            return !_.isUndefined(this.currentView) && this.currentView instanceof SearchView;
        },
        
        //  Shake the SearchView to bring attention to it -- the user might not have realized it is already open.
        _shakeSearchView: function() {
            this.currentView.shake();
        },
        
        _createSearchView: function (doSnapAnimation) {
            var searchView = new SearchView({
                collection: Search.get('results'),
                model: Search,
                //  Indicate whether view should appear immediately or animate.
                doSnapAnimation: doSnapAnimation
            });

            this.show(searchView);
        },
        
        //  Returns true if PlaylistsAreaView is currently shown
        _playlistsAreaViewExists: function () {
            return !_.isUndefined(this.currentView) && this.currentView instanceof PlaylistsAreaView;
        },
        
        _createPlaylistsAreaView: function() {
            var playlistsAreaView = new PlaylistsAreaView({
                collection: Playlists
            });
            
            this.show(playlistsAreaView);
        }
    });

    return LeftCoveringPaneRegion;
});
define('foreground/enum/notificationType',{
    None: 'none',
    Success: 'success',
    Error: 'error'
});
//  TODO: Are there other enums which are foreground only?;
define('foreground/model/notification',[
    'foreground/enum/notificationType'
], function (NotificationType) {
    'use strict';

    var Notification = Backbone.Model.extend({
        defaults: {
            type: NotificationType.None,
            text: ''
        },
        
        initialize: function() {
            this._ensureType();
        },
        
        _ensureType: function() {
            var type = this.get('type');
            
            if (type === NotificationType.None) {
                throw new Error('Notification expects to be initialized with a NotificationType');
            }
        }
    });

    return Notification;
});
define('text!template/notification.html',[],function () { return '<div class="text">\r\n    <%= text %>\r\n</div>\r\n<button class="button-icon remove colored">\r\n    <i class="fa fa-times"></i>\r\n</button>';});

define('foreground/view/notification/notificationView',[
	'foreground/enum/notificationType',
	'text!template/notification.html'
], function (NotificationType, NotificationTemplate) {
	'use strict';

	var NotificationView = Backbone.Marionette.ItemView.extend({
		className: function () {
			return this._getClassName();
		},
		template: _.template(NotificationTemplate),

		events: {
			'click .remove': '_hide'
		},

		transitionDelay: 200,
		hideTimeout: null,
		hideTimeoutDelay: 3000,

		onShow: function () {
			this.$el.transition({
				y: 0,
				opacity: 1
			}, this.transitionDelay, 'snap');

			this._setHideTimeout();
		},

		_hide: function () {
			this._clearHideTimeout();

			this.$el.transition({
				y: -1 * this.$el.height(),
				opacity: 0
			}, this.transitionDelay, this.destroy.bind(this));
		},

		_setHideTimeout: function () {
			this.hideTimeout = setTimeout(this._hide.bind(this), this.hideTimeoutDelay);
		},

		_clearHideTimeout: function () {
			clearTimeout(this.hideTimeout);
		},

		//  Dynamically determine the class name of the view in order to style it based on the type of notification
		_getClassName: function () {
			var className = 'notification ';

			var notificationType = this.model.get('type');
			switch (notificationType) {
				case NotificationType.Success:
					className += 'success';
					break;
				case NotificationType.Error:
					className += 'error';
					break;
			}

			return className;
		}
	});

	return NotificationView;
});
define('foreground/view/notification/notificationRegion',[
	'foreground/enum/notificationType',
	'foreground/model/notification',
	'foreground/view/notification/notificationView'
], function (NotificationType, Notification, NotificationView) {
	'use strict';

	var NotificationRegion = Backbone.Marionette.Region.extend({
		//  TODO: I am required to use ID selector here until bug resolved: https://github.com/marionettejs/backbone.marionette/issues/1530
		el: '#notification-region',

		initialize: function () {
			this.listenTo(Backbone.Wreqr.radio.channel('notification').commands, 'show', this._showNotification);
			//  TODO: Need to listen to background application triggering errors and build notifications from them
		},

		_showNotification: function (notification) {
			var notificationView = new NotificationView({
				model: notification
			});

			this.show(notificationView);
		}
	});

	return NotificationRegion;
});
//  The possible error values that the YouTube player might throw.
//  Data comes from: https://developers.google.com/youtube/js_api_reference#onError
define('common/enum/youTubePlayerError',{
    None: -1,
    InvalidParameter: 2,
    VideoNotFound: 100,
    NoPlayEmbedded: 101,
    NoPlayEmbedded2: 150
});
define('foreground/view/errorView',[],function () {
    'use strict';

    var ErrorView = Backbone.Marionette.ItemView.extend({
        className: 'error',
        template: false,
        text: '',

        initialize: function (options) {
            this.text = options.text;
        },

        onRender: function() {
            this.$el.html(this.text);
        }
    });

    return ErrorView;
});
define('foreground/view/prompt/errorPromptView',[
    'foreground/model/genericPrompt',
    'foreground/view/errorView',
    'foreground/view/prompt/genericPromptView'
], function (GenericPrompt, ErrorView, GenericPromptView) {
    'use strict';
    
    var ErrorPromptView = GenericPromptView.extend({
        initialize: function (options) {
            this.model = new GenericPrompt({
                title: chrome.i18n.getMessage('errorEncountered'),
                view: new ErrorView({
                    text: options.text
                })
            });

            GenericPromptView.prototype.initialize.apply(this, arguments);
        }
    });

    return ErrorPromptView;
});
define('text!template/googleSignIn.html',[],function () { return '<%= googleSignInMessage %>\r\n\r\n<div class="reminder">\r\n    <label>\r\n        <input type="checkbox">\r\n        <%= dontRemindMeAgainMessage %>\r\n    </label>\r\n</div>\r\n';});

define('foreground/view/googleSignInView',[
    'text!template/googleSignIn.html'
], function (GoogleSignInTemplate) {
    'use strict';
    
    var SignInManager = Streamus.backgroundPage.SignInManager;
    var Settings = Streamus.backgroundPage.Settings;
    
    var GoogleSignInView = Backbone.Marionette.ItemView.extend({
        className: 'google-sign-in',
        template: _.template(GoogleSignInTemplate),

        templateHelpers: {
            googleSignInMessage: chrome.i18n.getMessage('googleSignInMessage'),
            dontRemindMeAgainMessage: chrome.i18n.getMessage('dontRemindMeAgain')
        },
        
        ui: {
            reminderCheckbox: '.reminder input[type="checkbox"]'
        },
        
        _doOnHide: function() {
            var remindGoogleSignIn = !this.ui.reminderCheckbox.is(':checked');
            Settings.set('remindGoogleSignIn', remindGoogleSignIn);
        },
        
        _doRenderedOk: function () {
            SignInManager.set('needPromptGoogleSignIn', false);
        }
    });

    return GoogleSignInView;
});
define('foreground/view/prompt/googleSignInPromptView',[
    'foreground/model/genericPrompt',
    'foreground/view/googleSignInView',
    'foreground/view/prompt/genericPromptView'
], function (GenericPrompt, GoogleSignInView, GenericPromptView) {
    'use strict';

    var Settings = Streamus.backgroundPage.Settings;

    var GoogleSignInPromptView = GenericPromptView.extend({
        initialize: function () {
            this.model = new GenericPrompt({
                title: chrome.i18n.getMessage('signInToGoogle'),
                view: new GoogleSignInView()
            });

            GenericPromptView.prototype.initialize.apply(this, arguments);
        },

        reminderDisabled: function () {
            return !Settings.get('remindGoogleSignIn');
        }
    });

    return GoogleSignInPromptView;
});
define('text!template/linkUserId.html',[],function () { return '<%= linkAccountMessage %>\r\n\r\n<div class="reminder">\r\n    <label>\r\n        <input type="checkbox">\r\n        <%= dontRemindMeAgainMessage %>\r\n    </label>\r\n</div>\r\n';});

define('foreground/view/linkUserIdView',[
    'text!template/linkUserId.html'
], function (LinkUserIdTemplate) {
    'use strict';

    var SignInManager = Streamus.backgroundPage.SignInManager;
    var Settings = Streamus.backgroundPage.Settings;
    
    var LinkUserIdView = Backbone.Marionette.ItemView.extend({
        className: 'link-user-id',
        template: _.template(LinkUserIdTemplate),

        templateHelpers: {
            linkAccountMessage: chrome.i18n.getMessage('linkAccountMessage'),
            dontRemindMeAgainMessage: chrome.i18n.getMessage('dontRemindMeAgain')
        },
        
        ui: {
            reminderCheckbox: '.reminder input[type="checkbox"]'
        },
        
        _doOnHide: function() {
            var remindLinkUserId = !this.ui.reminderCheckbox.is(':checked');
            Settings.set('remindLinkUserId', remindLinkUserId);
        },

        _doRenderedOk: function () {
            SignInManager.saveGooglePlusId();
            SignInManager.set('needPromptLinkUserId', false);
        }
    });

    return LinkUserIdView;
});
define('foreground/view/prompt/linkUserIdPromptView',[
    'foreground/model/genericPrompt',
    'foreground/view/linkUserIdView',
    'foreground/view/prompt/genericPromptView'
], function (GenericPrompt, LinkUserIdView, GenericPromptView) {
    'use strict';

    var Settings = Streamus.backgroundPage.Settings;

    var LinkUserIdPromptView = GenericPromptView.extend({
        initialize: function () {
            this.model = new GenericPrompt({
                title: chrome.i18n.getMessage('linkAccountToGoogle'),
                view: new LinkUserIdView()
            });
            
            GenericPromptView.prototype.initialize.apply(this, arguments);
        },

        reminderDisabled: function () {
            return !Settings.get('remindLinkUserId');
        }
    });

    return LinkUserIdPromptView;
});
define('text!template/noPlayEmbedded.html',[],function () { return '<%= youTubePlayerErrorNoPlayEmbeddedMessage %>\r\n<br/>\r\n<br/>\r\nThis is commonly caused by a bug in Streamus which is a known issue and is being worked on. Restarting Streamus should fix the problem. Sorry.';});

define('foreground/view/noPlayEmbeddedView',[
    'text!template/noPlayEmbedded.html'
], function (NoPlayEmbeddedTemplate) {
    'use strict';

    var NoPlayEmbeddedView = Backbone.Marionette.ItemView.extend({
        className: 'no-play-embedded',
        template: _.template(NoPlayEmbeddedTemplate),

        templateHelpers: {
            youTubePlayerErrorNoPlayEmbeddedMessage: chrome.i18n.getMessage('youTubePlayerErrorNoPlayEmbedded')
        },

        _doRenderedOk: function () {
            chrome.runtime.reload();
        }
    });

    return NoPlayEmbeddedView;
});
define('foreground/view/prompt/noPlayEmbeddedPromptView',[
    'foreground/model/genericPrompt',
    'foreground/view/noPlayEmbeddedView',
    'foreground/view/prompt/genericPromptView'
], function (GenericPrompt, NoPlayEmbeddedView, GenericPromptView) {
    'use strict';
    
    var Player = Streamus.backgroundPage.YouTubePlayer;

    var NoPlayEmbeddedPromptView = GenericPromptView.extend({
        initialize: function () {
            this.model = new GenericPrompt({
                title: chrome.i18n.getMessage('errorEncountered'),
                okButtonText: chrome.i18n.getMessage('reload'),
                view: new NoPlayEmbeddedView()
            });
            
            GenericPromptView.prototype.initialize.apply(this, arguments);

            throw new Error("NoPlayEmbeddedView shown, loadedSongId:", Player.get('loadedSongId'));
        }
    });

    return NoPlayEmbeddedPromptView;
});
define('text!template/reloadStreamus.html',[],function () { return '<%= streamusIsTakingALongTimeToLoadReloadingMayHelpMessage %>';});

define('foreground/view/reloadStreamusView',[
    'text!template/reloadStreamus.html'
], function (ReloadStreamusTemplate) {
    'use strict';

    var ReloadStreamusView = Backbone.Marionette.ItemView.extend({
        className: 'reload-streamus',
        template: _.template(ReloadStreamusTemplate),
        
        templateHelpers: {
            streamusIsTakingALongTimeToLoadReloadingMayHelpMessage: chrome.i18n.getMessage('streamusIsTakingALongTimeToLoadReloadingMayHelp')
        },
        
        _doRenderedOk: function () {
            chrome.runtime.reload();
        }
    });

    return ReloadStreamusView;
});
define('foreground/view/prompt/reloadStreamusPromptView',[
    'foreground/model/genericPrompt',
    'foreground/view/reloadStreamusView',
    'foreground/view/prompt/genericPromptView'
], function (GenericPrompt, ReloadStreamusView, GenericPromptView) {
    'use strict';

    var ReloadStreamusPromptView = GenericPromptView.extend({
        initialize: function () {
            this.model = new GenericPrompt({
                title: chrome.i18n.getMessage('reloadStreamus'),
                okButtonText: chrome.i18n.getMessage('reload'),
                view: new ReloadStreamusView()
            });
            
            GenericPromptView.prototype.initialize.apply(this, arguments);
        }
    });

    return ReloadStreamusPromptView;
});
define('text!template/updateStreamus.html',[],function () { return '<%= anUpdateToStreamusIsAvailableMessage %>. <%= pleaseClickUpdateToReloadAndApplyTheUpdateMessage %>.';});

define('foreground/view/updateStreamusView',[
    'text!template/updateStreamus.html'
], function (UpdateStreamusTemplate) {
    'use strict';
    
    var UpdateStreamusView = Backbone.Marionette.ItemView.extend({
        className: 'update-streamus',
        template: _.template(UpdateStreamusTemplate),
        
        templateHelpers: {
            anUpdateToStreamusIsAvailableMessage: chrome.i18n.getMessage('anUpdateToStreamusIsAvailable'),
            pleaseClickUpdateToReloadAndApplyTheUpdateMessage: chrome.i18n.getMessage('pleaseClickUpdateToReloadAndApplyTheUpdate')
        },
        
        _doRenderedOk: function () {
            chrome.runtime.reload();
        }
    });

    return UpdateStreamusView;
});
define('foreground/view/prompt/updateStreamusPromptView',[
    'foreground/model/genericPrompt',
    'foreground/view/updateStreamusView',
    'foreground/view/prompt/genericPromptView'
], function (GenericPrompt, UpdateStreamusView, GenericPromptView) {
    'use strict';

    var UpdateStreamusPromptView = GenericPromptView.extend({
        initialize: function () {
            this.model = new GenericPrompt({
                title: chrome.i18n.getMessage('updateRequired'),
                okButtonText: chrome.i18n.getMessage('update'),
                view: new UpdateStreamusView()
            });
            
            GenericPromptView.prototype.initialize.apply(this, arguments);
        }
    });

    return UpdateStreamusPromptView;
});
define('foreground/view/prompt/promptRegion',[
    'common/enum/youTubePlayerError',
    'foreground/view/prompt/errorPromptView',
    'foreground/view/prompt/googleSignInPromptView',
    'foreground/view/prompt/linkUserIdPromptView',
    'foreground/view/prompt/noPlayEmbeddedPromptView',
    'foreground/view/prompt/reloadStreamusPromptView',
    'foreground/view/prompt/updateStreamusPromptView'
], function (YouTubePlayerError, ErrorPromptView, GoogleSignInPromptView, LinkUserIdPromptView, NoPlayEmbeddedPromptView, ReloadStreamusPromptView, UpdateStreamusPromptView) {
    'use strict';
    
    var Player = Streamus.backgroundPage.YouTubePlayer;
    var SignInManager = Streamus.backgroundPage.SignInManager;

    var PromptRegion = Backbone.Marionette.Region.extend({
        //  TODO: I am required to use ID selector here until bug resolved: https://github.com/marionettejs/backbone.marionette/issues/1530
        el: '#prompt-region',
        showReloadPromptTimeout: null,
        
        initialize: function () {
            this.listenTo(Backbone.Wreqr.radio.channel('prompt').vent, 'show', this._showPrompt);
            this.listenTo(Player, 'error', this._showYouTubeErrorPrompt);
            this.listenTo(SignInManager, 'change:needPromptLinkUserId', this._onChangeNeedPromptLinkUserId);
            this.listenTo(SignInManager, 'change:needPromptGoogleSignIn', this._onChangeNeedPromptGoogleSignIn);
        },
        
        //  Make sure Streamus stays up to date because if my Server de-syncs people won't be able to save properly.
        //  http://developer.chrome.com/extensions/runtime#method-requestUpdateCheck
        promptIfUpdateAvailable: function () {
            chrome.runtime.onUpdateAvailable.addListener(this._showUpdateStreamusPrompt.bind(this));
            //  Don't need to handle the update check -- just need to call it so that onUpdateAvailable will fire.
            chrome.runtime.requestUpdateCheck(function () { });
        },
        
        //  If SignInManager indicates that sign-in state has changed and necessitates asking the user to link their account to Google, do so.
        //  This might happen while the foreground UI isn't open (most likely, in fact), so need to check state upon foreground UI opening.
        promptIfNeedLinkUserId: function() {
            if (SignInManager.get('needPromptLinkUserId')) {
                this._showLinkUserIdPrompt();
            }
        },
        
        promptIfNeedGoogleSignIn: function() {
            if (SignInManager.get('needPromptGoogleSignIn')) {
                this._showGoogleSignInPrompt();
            }
        },
        
        //  If the foreground hasn't properly initialized after 5 seconds offer the ability to restart the program.
        //  Background.js might have gone awry for some reason and it is not always clear how to restart Streamus via chrome://extension
        startShowReloadPromptTimer: function () {
            this.showReloadPromptTimeout = setTimeout(this._showReloadStreamusPrompt.bind(this), 5000);
        },

        hideReloadStreamusPrompt: function () {
            clearTimeout(this.showReloadPromptTimeout);

            if (this.currentView instanceof ReloadStreamusPromptView) {
                this.currentView.hide();
            }
        },
        
        _onChangeNeedPromptLinkUserId: function (model, needPromptLinkUserId) {
            if (needPromptLinkUserId) {
                this._showLinkUserIdPrompt();
            }
        },
        
        _onChangeNeedPromptGoogleSignIn: function (model, needPromptGoogleSignIn) {
            if (needPromptGoogleSignIn) {
                this._showGoogleSignInPrompt();
            }
        },
        
        //  Prompt the user to confirm that they want to link their Google+ ID to the currently signed in account.
        _showLinkUserIdPrompt: function () {
            this._showPrompt(LinkUserIdPromptView);
        },
        
        _showGoogleSignInPrompt: function () {
            this._showPrompt(GoogleSignInPromptView);
        },
        
        //  Display a prompt to the user indicating that they should restart Streamus because an update has been downloaded.
        _showUpdateStreamusPrompt: function () {
            this._showPrompt(UpdateStreamusPromptView);
        },
        
        _showReloadStreamusPrompt: function() {
            this._showPrompt(ReloadStreamusPromptView);
        },
        
        _showPrompt: function (PromptView, options) {
            var promptView = new PromptView(_.extend({
                containerHeight: this.$el.height()
            }, options));

            //  Sometimes checkbox reminders are in place which would indicate the view's OK event should run immediately instead of being shown to the user.
            var reminderDisabled = promptView.reminderDisabled();
            
            if (reminderDisabled) {
                var subView = promptView.model.get('view');
                var doOkFunction = subView.doOk;
                
                if (_.isFunction(doOkFunction)) {
                    doOkFunction.call(subView);
                }
            } else {
                this.show(promptView);
            }
        },
        
        //  Whenever the YouTube API throws an error in the background, communicate
        //  that information to the user in the foreground via prompt.
        _showYouTubeErrorPrompt: function (youTubeError) {
            if (youTubeError === YouTubePlayerError.NoPlayEmbedded || youTubeError === YouTubePlayerError.NoPlayEmbedded2) {
                this._showPrompt(NoPlayEmbeddedPromptView);
            } else {
                var text = chrome.i18n.getMessage('errorEncountered');

                switch (youTubeError) {
                    case YouTubePlayerError.InvalidParameter:
                        text = chrome.i18n.getMessage('youTubePlayerErrorInvalidParameter');
                        break;
                    case YouTubePlayerError.VideoNotFound:
                        text = chrome.i18n.getMessage('youTubePlayerErrorSongNotFound');
                        break;
                }

                this._showPrompt(ErrorPromptView, {
                    text: text
                });
            }
        }
    });

    return PromptRegion;
});
define('common/enum/playerState',{
    Unstarted: -1,
    Ended: 0,
    Playing: 1,
    Paused: 2,
    Buffering: 3,
    SongCued: 5
});
define('text!template/settings.html',[],function () { return '<div class="general topic-group">\r\n    <div class="topic">\r\n        <%= generalMessage %>\r\n    </div>\r\n\r\n    <div class="category">\r\n        <ul>\r\n            <li>\r\n                <label>\r\n                    <%= songQualityMessage %>\r\n                \r\n                    <select id="suggested-quality">\r\n                        <option value="highres" <%= suggestedQuality === \'highres\' ? \'selected\' : \'\' %>>\r\n                            <%= highestMessage %>\r\n                        </option>\r\n                        <option value="default" <%= suggestedQuality === \'default\' ? \'selected\' : \'\' %>>\r\n                            <%= autoMessage %>\r\n                        </option>\r\n                        <option value="small" <%= suggestedQuality === \'small\' ? \'selected\' : \'\' %>>\r\n                            <%= lowestMessage %>\r\n                        </option>\r\n                    </select>\r\n                </label>\r\n            </li>\r\n            <li>\r\n                <label>\r\n                    <input type="checkbox" id="show-tooltips" <%= showTooltips ? \'checked\' : \'\' %>>\r\n                    <%= showTooltipsMessage %>\r\n                </label>\r\n            </li>\r\n            <li>\r\n                <label>\r\n                    <input type="checkbox" id="always-open-to-search" <%= alwaysOpenToSearch ? \'checked\' : \'\' %> >\r\n                    <%= alwaysOpenToSearchMessage %>\r\n                </label>\r\n            </li>\r\n            <li>\r\n                <label>\r\n                    <input type="checkbox" id="always-open-in-tab" <%= alwaysOpenInTab ? \'checked\' : \'\' %> >\r\n                    <%= alwaysOpenInTabMessage %>\r\n                </label>\r\n            </li>\r\n        </ul>\r\n    </div>\r\n</div>\r\n\r\n<div class="reminders topic-group">\r\n    <div class="topic">\r\n        <%= remindersMessage %>\r\n    </div>\r\n    <div class="category">\r\n        <ul>\r\n            <li>\r\n                <label>\r\n                    <input type="checkbox" id="remind-clear-stream" <%= remindClearStream ? \'checked\' : \'\' %>>\r\n                    <%= remindClearStreamMessage %>\r\n                </label>\r\n            </li>\r\n            <li>\r\n                <label>\r\n                    <input type="checkbox" id="remind-delete-playlist" <%= remindDeletePlaylist ? \'checked\' : \'\' %>>\r\n                    <%= remindDeletePlaylistMessage %>\r\n                </label>\r\n            </li>\r\n            <li>\r\n                <label>\r\n                    <input type="checkbox" id="remind-link-user-id" <%= remindLinkUserId ? \'checked\' : \'\' %>>\r\n                    <%= remindLinkAccountMessage %>\r\n                </label>\r\n            </li>\r\n            <li>\r\n                <label>\r\n                    <input type="checkbox" id="remind-google-sign-in" <%= remindGoogleSignIn ? \'checked\' : \'\' %>>\r\n                    <%= remindGoogleSignInMessage %>\r\n                </label>\r\n            </li>\r\n        </ul>\r\n    </div>\r\n</div>\r\n\r\n';});

define('foreground/view/settingsView',[
    'text!template/settings.html'
], function (SettingsTemplate) {
    'use strict';

    var Player = Streamus.backgroundPage.YouTubePlayer;

    var SettingsView = Backbone.Marionette.ItemView.extend({
        className: 'settings',
        template: _.template(SettingsTemplate),
        
        templateHelpers: {
            generalMessage: chrome.i18n.getMessage('general'),
            songQualityMessage: chrome.i18n.getMessage('songQuality'),
            highestMessage: chrome.i18n.getMessage('highest'),
            autoMessage: chrome.i18n.getMessage('auto'),
            lowestMessage: chrome.i18n.getMessage('lowest'),
            showTooltipsMessage: chrome.i18n.getMessage('showTooltips'),
            alwaysOpenToSearchMessage: chrome.i18n.getMessage('alwaysOpenToSearch'),
            alwaysOpenInTabMessage: chrome.i18n.getMessage('alwaysOpenInTab'),
            remindersMessage: chrome.i18n.getMessage('reminders'),
            remindClearStreamMessage: chrome.i18n.getMessage('remindClearStream'),
            remindDeletePlaylistMessage: chrome.i18n.getMessage('remindDeletePlaylist'),
            remindLinkAccountMessage: chrome.i18n.getMessage('remindLinkAccount'),
            remindGoogleSignInMessage: chrome.i18n.getMessage('remindGoogleSignIn')
        },
        
        ui: {
            suggestedQualitySelect: '#suggested-quality',
            showTooltipsCheckbox: '#show-tooltips',
            remindClearStreamCheckbox: '#remind-clear-stream',
            remindDeletePlaylistCheckbox: '#remind-delete-playlist',
            remindLinkUserIdCheckbox: '#remind-link-user-id',
            remindGoogleSignInCheckbox: '#remind-google-sign-in',
            alwaysOpenToSearchCheckbox: '#always-open-to-search',
            alwaysOpenInTabCheckbox: '#always-open-in-tab'
        },
        
        events: {
            'change @ui.suggestedQualitySelect': '_setSuggestedQuality',
            'change @ui.remindClearStreamCheckbox': '_setRemindClearStream',
            'change @ui.remindDeletePlaylistCheckbox': '_setRemindDeletePlaylist',
            'change @ui.showTooltipsCheckbox': '_setShowTooltips',
            'change @ui.alwaysOpenToSearchCheckbox': '_setAlwaysOpenToSearch',
            'change @ui.remindLinkUserIdCheckbox': '_setRemindLinkUserId',
            'change @ui.remindGoogleSignInCheckbox': '_setRemindGoogleSignIn',
            'change @ui.alwaysOpenInTabCheckbox': '_setAlwaysOpenInTab'
        },
        
        //  TODO: Refactor w/ enum so this doesn't grow indefinitely
        _setSuggestedQuality: function () {
            var suggestedQuality = this.ui.suggestedQualitySelect.val();
            this.model.set('suggestedQuality', suggestedQuality);
            Player.setSuggestedQuality(suggestedQuality);
        },
        
        _setRemindClearStream: function () {
            var remindClearStream = this.ui.remindClearStreamCheckbox.is(':checked');
            this.model.set('remindClearStream', remindClearStream);
        },
        
        _setRemindDeletePlaylist: function () {
            var remindDeletePlaylist = this.ui.remindDeletePlaylistCheckbox.is(':checked');
            this.model.set('remindDeletePlaylist', remindDeletePlaylist);
        },
        
        _setRemindLinkUserId: function () {
            var remindLinkUserId = this.ui.remindLinkUserIdCheckbox.is(':checked');
            this.model.set('remindLinkUserId', remindLinkUserId);
        },
        
        _setRemindGoogleSignIn: function () {
            var remindGoogleSignIn = this.ui.remindGoogleSignInCheckbox.is(':checked');
            this.model.set('remindGoogleSignIn', remindGoogleSignIn);
        },

        _setShowTooltips: function () {
            var showTooltips = this.ui.showTooltipsCheckbox.is(':checked');
            this.model.set('showTooltips', showTooltips);
        },
        
        _setAlwaysOpenToSearch: function () {
            var alwaysOpenToSearch = this.ui.alwaysOpenToSearchCheckbox.is(':checked');
            this.model.set('alwaysOpenToSearch', alwaysOpenToSearch);
        },
        
        _setAlwaysOpenInTab: function() {
            var alwaysOpenInTab = this.ui.alwaysOpenInTabCheckbox.is(':checked');
            this.model.set('alwaysOpenInTab', alwaysOpenInTab);
        }
    });

    return SettingsView;
});
define('foreground/view/prompt/settingsPromptView',[
    'foreground/model/genericPrompt',
    'foreground/view/settingsView',
    'foreground/view/prompt/genericPromptView'
], function (GenericPrompt, SettingsView, GenericPromptView) {
    'use strict';
    
    var Settings = Streamus.backgroundPage.Settings;
    
    var SettingsPromptView = GenericPromptView.extend({
        initialize: function () {
            this.model = new GenericPrompt({
                title: chrome.i18n.getMessage('settings'),
                view: new SettingsView({
                    model: Settings
                }),
                showOkButton: false
            });
            
            GenericPromptView.prototype.initialize.apply(this, arguments);
        }
    });

    return SettingsPromptView;
});
define('text!template/menuArea.html',[],function () { return '<button class="menu-button button-icon tooltipable">\r\n    <i class="fa fa-cogs"></i>\r\n</button>\r\n\r\n<ul class="menu">\r\n    <li class="settings clickable"><%= settingsMessage %></li>\r\n    <li class="keyboard-shortcuts clickable"><%= keyboardShortcutsMessage %></li>\r\n    <li class="view-in-tab clickable"><%= viewInTabMessage %></li>\r\n    <li class="donate clickable"><%= donateMessage %></li>\r\n    <li class="reload clickable"><%= reloadMessage %></li>\r\n</ul>';});

define('foreground/view/rightBasePane/menuAreaView',[
    'foreground/view/prompt/settingsPromptView',
    'text!template/menuArea.html'
], function (SettingsPromptView, MenuAreaTemplate) {
    'use strict';
    
    var TabManager = Streamus.backgroundPage.TabManager;

    var MenuAreaView = Backbone.Marionette.ItemView.extend({
        id: 'menu-area',
        template: _.template(MenuAreaTemplate),
        
        templateHelpers: function () {
            return {
                settingsMessage: chrome.i18n.getMessage('settings'),
                keyboardShortcutsMessage: chrome.i18n.getMessage('keyboardShortcuts'),
                viewInTabMessage: chrome.i18n.getMessage('viewInTab'),
                donateMessage: chrome.i18n.getMessage('donate'),
                reloadMessage: chrome.i18n.getMessage('reload')
            };
        },

        events: {
            'click @ui.menuButton': '_toggleMenu',
            'click @ui.settingsMenuItem': '_showSettingsPrompt',
            'click @ui.keyboardShortcutsMenuItem': '_openKeyboardShortcutsTab',
            'click @ui.viewInTabMenuItem': '_openStreamusTab',
            'click @ui.donateMenuItem': '_openDonateTab',
            'click @ui.restartMenuItem': '_restart'
        },

        ui: {
            menuButton: '.menu-button',
            menu: '.menu',
            settingsMenuItem: '.menu .settings',
            viewInTabMenuItem: '.menu .view-in-tab',
            donateMenuItem: '.menu .donate',
            keyboardShortcutsMenuItem: '.menu .keyboard-shortcuts',
            restartMenuItem: '.menu .reload'
        },

        menuShown: false,
        
        initialize: function () {
            this.listenTo(Backbone.Wreqr.radio.channel('global').vent, 'clickedElement', this._onClickedElement);
        },
        
        _onClickedElement: function (clickedElement) {
            if (clickedElement.closest(this.ui.menuButton.selector).length === 0) {
                this._hideMenu();
            }
        },

        _toggleMenu: function () {
            this.menuShown ? this._hideMenu() : this._showMenu();
        },
        
        _showMenu: function () {
            this.ui.menu.show();
            this.ui.menu.transition({
                opacity: 1
            }, 200, 'snap');

            this.ui.menuButton.addClass('enabled');
            this.menuShown = true;
        },
        
        _hideMenu: function () {
            this.ui.menu.transition({
                opacity: 0
            }, 200, 'snap', function() {
                this.ui.menu.hide();
            }.bind(this));
            
            this.ui.menuButton.removeClass('enabled');
            this.menuShown = false;
        },
        
        _showSettingsPrompt: function () {
            Backbone.Wreqr.radio.channel('prompt').vent.trigger('show', SettingsPromptView);
        },
        
        _openStreamusTab: function () {
            TabManager.showStreamusTab();
        },
        
        _openDonateTab: function () {
            TabManager.showTab('https://streamus.com/#donate');
        },
        
        _openKeyboardShortcutsTab: function() {
            TabManager.showTab('chrome://extensions/configureCommands');
        },
        
        _restart: function() {
            chrome.runtime.reload();
        }
    });

    return MenuAreaView;
});
define('common/enum/repeatButtonState',{
    Disabled: 0,
    RepeatSong: 1,
    RepeatStream: 2
});
define('text!template/clearStream.html',[],function () { return '<%= areYouSureYouWantToClearYourStreamMessage %>\r\n\r\n<div class="reminder">\r\n    <label>\r\n        <input type="checkbox">\r\n        <%= dontRemindMeAgainMessage %>\r\n    </label>\r\n</div>\r\n';});

define('foreground/view/clearStreamView',[
    'text!template/clearStream.html'
], function (ClearStreamTemplate) {
    'use strict';

    var StreamItems = Streamus.backgroundPage.StreamItems;
    var Settings = Streamus.backgroundPage.Settings;

    var ClearStreamView = Backbone.Marionette.ItemView.extend({
        className: 'clear-stream',
        template: _.template(ClearStreamTemplate),
        
        templateHelpers: {
            areYouSureYouWantToClearYourStreamMessage: chrome.i18n.getMessage('areYouSureYouWantToClearYourStream'),
            dontRemindMeAgainMessage: chrome.i18n.getMessage('dontRemindMeAgain')
        },
        
        ui: {
            reminderCheckbox: '.reminder input[type="checkbox"]'
        },
        
        doOk: function() {
            StreamItems.clear();
        },

        _doRenderedOk: function () {           
            var remindClearStream = !this.ui.reminderCheckbox.is(':checked');
            Settings.set('remindClearStream', remindClearStream);

            this.doOk();
        }
    });

    return ClearStreamView;
});
define('foreground/view/prompt/clearStreamPromptView',[
    'foreground/model/genericPrompt',
    'foreground/view/clearStreamView',
    'foreground/view/prompt/genericPromptView'
], function (GenericPrompt, ClearStreamView, GenericPromptView) {
    'use strict';
    
    var Settings = Streamus.backgroundPage.Settings;

    var ClearStreamPromptView = GenericPromptView.extend({
        initialize: function () {
            this.model = new GenericPrompt({
                title: chrome.i18n.getMessage('areYouSure'),
                view: new ClearStreamView()
            });
            
            GenericPromptView.prototype.initialize.apply(this, arguments);
        },

        reminderDisabled: function () {
            return !Settings.get('remindClearStream');
        }
    });

    return ClearStreamPromptView;
});
define('foreground/model/streamAction',[
    'foreground/view/prompt/clearStreamPromptView',
    'foreground/view/clearStreamView',
    'foreground/view/prompt/saveSongsPromptView'
], function (ClearStreamPromptView, ClearStreamView, SaveSongsPromptView) {
    'use strict';

    var StreamItems = Streamus.backgroundPage.StreamItems;

    var StreamAction = Backbone.Model.extend({
        clearStream: function () {
            if (StreamItems.length > 0) {
                this._showClearStreamPrompt();
            }
        },
        
        saveStream: function() {
            if (StreamItems.length > 0) {
                this._showSaveSongsPrompt();
            }
        },
        
        _showClearStreamPrompt: function () {
            Backbone.Wreqr.radio.channel('prompt').vent.trigger('show', ClearStreamPromptView);
        },
        
        _showSaveSongsPrompt: function() {
            Backbone.Wreqr.radio.channel('prompt').vent.trigger('show', SaveSongsPromptView, {
                songs: StreamItems.pluck('song')
            });
        }
    });

    return new StreamAction();
});
define('text!template/stream.html',[],function () { return '<div class="big-text-wrapper full flex-column">\r\n    <div class="big-text stream-empty">\r\n        <div class="header"><%= streamEmptyMessage %></div>\r\n        \r\n        <%= whyNotAddASongFromAPlaylistOrMessage %> <span class="show-search search-link clickable lowercase"><%= searchForSongsMessage %></span>?\r\n    </div>\r\n    \r\n    <div class="list">\r\n        <div class="stream-items droppable-list"></div>\r\n    </div>\r\n</div>\r\n\r\n<div class="context-buttons">\r\n    <div class="pull-left">\r\n        <button id="shuffle-button" class="button-icon button-small tooltipable">\r\n            <i class="fa fa-random"></i>\r\n        </button>\r\n        \r\n        <button id="repeat-button" class="button-icon button-small tooltipable">\r\n        </button>\r\n\r\n        <button id="radio-button" class="button-icon button-small tooltipable">\r\n            <i class="icon-signal"></i>\r\n        </button>\r\n    </div>\r\n    \r\n    <div class="pull-right">\r\n        <button id="save-stream" class="button-icon button-small save disabled tooltipable">\r\n            <i class="fa fa-save"></i>\r\n        </button>\r\n\r\n        <button class="button-icon button-small clear tooltipable" title="<%= clearStreamMessage %>" >\r\n            <i class="fa fa-trash-o"></i>\r\n        </button>\r\n    </div>\r\n</div>';});

define('foreground/view/rightBasePane/streamView',[
    'common/enum/listItemType',
    'common/enum/repeatButtonState',
    'foreground/model/streamAction',
    'foreground/view/behavior/multiSelect',
    'foreground/view/behavior/slidingRender',
    'foreground/view/behavior/sortable',
    'foreground/view/behavior/tooltip',
    'foreground/view/rightBasePane/streamItemView',
    'text!template/stream.html'
], function (ListItemType, RepeatButtonState, StreamAction, MultiSelect, SlidingRender, Sortable, Tooltip, StreamItemView, StreamTemplate) {
    'use strict';

    var SignInManager = Streamus.backgroundPage.SignInManager;
    var RadioButton = Streamus.backgroundPage.RadioButton;
    var RepeatButton = Streamus.backgroundPage.RepeatButton;
    var ShuffleButton = Streamus.backgroundPage.ShuffleButton;
    
    var StreamView = Backbone.Marionette.CompositeView.extend({
        className: 'stream full flex-column',
        childViewContainer: '@ui.childContainer',
        childView: StreamItemView,
        
        //  Overwrite resortView to only render children as expected
        resortView: function () {
            this._renderChildren();
        },

        template: _.template(StreamTemplate),
        templateHelpers: function () {
            return {
                streamEmptyMessage: chrome.i18n.getMessage('streamEmpty'),
                saveStreamMessage: chrome.i18n.getMessage('saveStream'),
                clearStreamMessage: chrome.i18n.getMessage('clearStream'),
                searchForSongsMessage: chrome.i18n.getMessage('searchForSongs'),
                whyNotAddASongFromAPlaylistOrMessage: chrome.i18n.getMessage('whyNotAddASongFromAPlaylistOr'),
                cantSaveNotSignedInMessage: chrome.i18n.getMessage('cantSaveNotSignedIn')
            };
        },
        
        childViewOptions: {
            type: ListItemType.StreamItem
        },
        
        events: {
            'click @ui.clearStreamButton': '_clear',
            'click @ui.saveStreamButton:not(.disabled)': '_save',
            'click @ui.shuffleButton': '_toggleShuffle',
            'click @ui.radioButton': '_toggleRadio',
            'click @ui.repeatButton': '_toggleRepeat',
            'click @ui.showSearch': function () {
                Backbone.Wreqr.radio.channel('global').vent.trigger('showSearch', true);
            }
        },
        
        collectionEvents: {
            'add remove reset': '_setViewState'
        },
        
        ui: {
            buttons: '.button-icon',
            streamEmptyMessage: '.stream-empty',
            contextButtons: '.context-buttons',
            saveStreamButton: '#save-stream',
            childContainer: '.stream-items',
            shuffleButton: '#shuffle-button',
            radioButton: '#radio-button',
            repeatButton: '#repeat-button',
            clearStreamButton: 'button.clear',
            showSearch: '.show-search'
        },
        
        behaviors: {
            MultiSelect: {
                behaviorClass: MultiSelect
            },
            SlidingRender: {
                behaviorClass: SlidingRender
            },
            Sortable: {
                behaviorClass: Sortable
            },
            Tooltip: {
                behaviorClass: Tooltip
            }
        },
        
        initialize: function () {
            this.listenTo(SignInManager, 'change:signedIn', this._updateSaveStreamButton);
            this.listenTo(ShuffleButton, 'change:enabled', this._setShuffleButtonState);
            this.listenTo(RadioButton, 'change:enabled', this._setRadioButtonState);
            this.listenTo(RepeatButton, 'change:state', this._setRepeatButtonState);
        },
        
        onRender: function () {
            this._setViewState();
            this._setRepeatButtonState();
            this._setShuffleButtonState();
            this._setRadioButtonState();
            this._updateSaveStreamButton();
        },
        
        _setViewState: function() {
            this._toggleBigText();
            this._toggleContextButtons();
        },
        
        _updateSaveStreamButton: function () {
            var signedIn = SignInManager.get('signedIn');
            
            var templateHelpers = this.templateHelpers();
            var newTitle = signedIn ? templateHelpers.saveStreamMessage : templateHelpers.cantSaveNotSignedInMessage;

            this.ui.saveStreamButton.toggleClass('disabled', !signedIn);
            this.ui.saveStreamButton.attr('title', newTitle);
        },
        
        //  Hide the empty message if there is anything in the collection
        _toggleBigText: function () {
            this.ui.streamEmptyMessage.toggleClass('hidden', this.collection.length > 0);
        },
        
        //  Show buttons if there is anything in the collection otherwise hide
        _toggleContextButtons: function () {
            this.ui.contextButtons.toggle(this.collection.length > 0);
            //  Need to update viewportHeight in slidingRender behavior:
            this.triggerMethod('ListHeightUpdated');
        },
        
        _clear: function() {
            StreamAction.clearStream();
        },
        
        _save: function() {
            StreamAction.saveStream();
        },
        
        _toggleShuffle: function() {
            ShuffleButton.toggleEnabled();
        },
        
        _toggleRadio: function() {
            RadioButton.toggleEnabled();
        },
        
        _toggleRepeat: function() {
            RepeatButton.toggleRepeatState();
        },
        
        _setRepeatButtonState: function() {
            var state = RepeatButton.get('state');
            //  The button is considered enabled if it is anything but disabled.
            var enabled = state !== RepeatButtonState.Disabled;

            var title = '';
            var icon = $('<i>', { 'class': 'fa fa-repeat' });
            switch (state) {
                case RepeatButtonState.Disabled:
                    title = chrome.i18n.getMessage('repeatDisabled');
                    break;
                case RepeatButtonState.RepeatSong:
                    title = chrome.i18n.getMessage('repeatSong');
                    icon = $('<i>', { 'class': 'fa fa-repeat repeat-song' });
                    break;
                case RepeatButtonState.RepeatStream:
                    title = chrome.i18n.getMessage('repeatStream');
                    icon = $('<i>', { 'class': 'fa fa-repeat repeat-stream' });
                    break;
            }

            this.ui.repeatButton.toggleClass('enabled', enabled).attr('title', title).empty().append(icon);
        },
        
        _setShuffleButtonState: function() {
            var enabled = ShuffleButton.get('enabled');

            var title;
            if (enabled) {
                title = chrome.i18n.getMessage('shuffleEnabled');
            } else {
                title = chrome.i18n.getMessage('shuffleDisabled');
            }

            this.ui.shuffleButton.toggleClass('enabled', enabled).attr('title', title);
        },
        
        _setRadioButtonState: function () {
            var enabled = RadioButton.get('enabled');
            
            var title;
            if (enabled) {
                title = chrome.i18n.getMessage('radioEnabled');
            } else {
                title = chrome.i18n.getMessage('radioDisabled');
            }
            
            this.ui.radioButton.toggleClass('enabled', enabled).attr('title', title);
        }
    });

    return StreamView;
});
define('text!template/timeProgress.html',[],function () { return '<div class="time-elapsed tooltipable clickable" title="<%= elapsedTimeMessage %>"></div>\r\n\r\n<div class="time-slider">\r\n    <div class="progress"></div>\r\n    <input class="time-range clickable" type="range">\r\n</div>\r\n\r\n<div class="duration tooltipable" title="<%= totalTimeMessage %>"></div>';});

//  A progress bar which shows the elapsed time as compared to the total time of the current song.
define('foreground/view/rightBasePane/timeProgressView',[
    'common/enum/playerState',
    'common/model/utility',
    'foreground/view/behavior/tooltip',
    'text!template/timeProgress.html'
], function (PlayerState, Utility, Tooltip, TimeProgressTemplate) {
    'use strict';

    var StreamItems = Streamus.backgroundPage.StreamItems;
    var Settings = Streamus.backgroundPage.Settings;

    var TimeProgressView = Backbone.Marionette.ItemView.extend({
        className: 'time-progress full',
        template: _.template(TimeProgressTemplate),
        
        templateHelpers: {
            elapsedTimeMessage: chrome.i18n.getMessage('elapsedTime'),
            totalTimeMessage: chrome.i18n.getMessage('totalTime')
        },
        
        events: {
            'input @ui.timeRange:not(.disabled)': '_updateProgress',
            'mousewheel @ui.timeRange:not(.disabled)': '_mousewheelUpdateProgress',
            'mousedown @ui.timeRange:not(.disabled)': '_startSeeking',
            'mouseup @ui.timeRange:not(.disabled)': '_seekToTime',
            'click @ui.timeElapsedLabel': '_toggleShowTimeRemaining'
        },
        
        modelEvents: {
            'change:currentTime': '_updateCurrentTime',
            'change:state': '_stopSeeking'
        },
        
        ui: {
            //  Progress is the shading filler for the volumeRange's value.
            progress: '.progress',
            timeRange: '.time-range',
            timeElapsedLabel: '.time-elapsed',
            durationLabel: '.duration'
        },
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },
       
        autoUpdate: true,
        
        initialize: function () {
            this.listenTo(StreamItems, 'remove reset', this._clearOnEmpty);
            this.listenTo(StreamItems, 'add', this._enable);
            this.listenTo(StreamItems, 'change:active', this._restart);
        },

        onRender: function () {
            this.ui.timeRange.toggleClass('disabled', StreamItems.length === 0);
            
            //  If a song is currently playing when the GUI opens then initialize with those values.
            //  Set total time before current time because it affects the range's max.
            this._setTotalTime(this._getCurrentSongDuration());
            this._setCurrentTime(this.model.get('currentTime'));
        },
        
        //  Allow the user to manual time change by click or scroll.
        _mousewheelUpdateProgress: function (event) {
            var delta = event.originalEvent.wheelDeltaY / 120;
            var currentTime = parseInt(this.ui.timeRange.val());

            this._setCurrentTime(currentTime + delta);

            this.model.seekTo(currentTime + delta);
        },

        _startSeeking: function (event) {
            //  1 is primary mouse button, usually left
            if (event.which === 1) {
                this.autoUpdate = false;
            }
        },
        
        _stopSeeking: function () {
            //  Seek is known to have finished when the player announces a state change that isn't buffering / unstarted.
            var state = this.model.get('state');

            if (state == PlayerState.Playing || state == PlayerState.Paused) {
                this.autoUpdate = true;
            }
        },

        _seekToTime: function (event) {
            //  1 is primary mouse button, usually left
            if (event.which === 1) {
                //  Bind to progressBar mouse-up to support dragging as well as clicking.
                //  I don't want to send a message until drag ends, so mouseup works nicely. 
                var currentTime = parseInt(this.ui.timeRange.val());
                this.model.seekTo(currentTime);
            }
        },
        
        _toggleShowTimeRemaining: function() {
            var showTimeRemaining = Settings.get('showTimeRemaining');
            //  Toggle showTimeRemaining and then read the new state and apply it.
            Settings.set('showTimeRemaining', !showTimeRemaining);

            if (!showTimeRemaining) {
                this.ui.timeElapsedLabel.attr('title', chrome.i18n.getMessage('timeRemaining'));
            } else {
                this.ui.timeElapsedLabel.attr('title', chrome.i18n.getMessage('elapsedTime'));
            }

            this.ui.timeElapsedLabel.toggleClass('timeRemaining', !showTimeRemaining);
            this._updateProgress();
        },
        
        _enable: function () {
            this.ui.timeRange.removeClass('disabled');
        },
        
        _clearOnEmpty: function () {
            if (StreamItems.length === 0) {
                this._clear();
            }
        },
        
        _clear: function () {
            this._setCurrentTime(0);
            this._setTotalTime(0);
            this.ui.timeRange.addClass('disabled');
        },
        
        _restart: function () {
            //  Disable auto-updates here because there's a split second while changing songs that a timer tick makes things flicker weirdly.
            this.autoUpdate = false;

            this._setCurrentTime(0);
            this._setTotalTime(this._getCurrentSongDuration());

            this.autoUpdate = true;
        },
        
        _setCurrentTime: function (currentTime) {
            this.ui.timeRange.val(currentTime);
            this._updateProgress();
        },

        _setTotalTime: function (totalTime) {
            this.ui.timeRange.prop('max', totalTime);
            this._updateProgress();
        },
        
        _updateCurrentTime: function () {
            if (this.autoUpdate) {
                this._setCurrentTime(this.model.get('currentTime'));
            }
        },

        //  Repaints the progress bar's filled-in amount based on the % of time elapsed for current song.
        //  Keep separate from render because render is based on the player's values and updateProgress is based on the progress bar's values.
        //  This is an important distinction because when the user is dragging the progress bar -- the player won't be updating -- but progress bar
        //  values need to be re-rendered.
        _updateProgress: function () {
            var currentTime = parseInt(this.ui.timeRange.val());
            var totalTime = parseInt(this.ui.timeRange.prop('max'));

            //  Don't divide by 0.
            var progressPercent = totalTime === 0 ? 0 : currentTime * 100 / totalTime;
            this.ui.progress.width(progressPercent + '%');
            
            if (Settings.get('showTimeRemaining')) {
                //  Calculate the time remaining from the current time and show that instead.
                var timeRemaining = totalTime - currentTime;
                this.ui.timeElapsedLabel.text(Utility.prettyPrintTime(timeRemaining));
            } else {
                this.ui.timeElapsedLabel.text(Utility.prettyPrintTime(currentTime));
            }

            this.ui.durationLabel.text(Utility.prettyPrintTime(totalTime));
        },

        //  Return 0 or active song's duration.
        _getCurrentSongDuration: function () {
            var duration = 0;

            if (StreamItems.length > 0) {
                var activeStreamItem = StreamItems.getActiveItem();
                duration = activeStreamItem.get('song').get('duration');
            }

            return duration;
        }
    });

    return TimeProgressView;
});
define('text!template/volume.html',[],function () { return '<button id="mute-button" class="mute button-icon<%= muted ? \' muted\' : \'\' %>"> \r\n</button>\r\n\r\n<div class="volume-slider hidden">\r\n    <div class="progress" style="height: <%= volume %>%">\r\n    </div>\r\n\r\n    <input class="volume-range clickable" type="range" value="<%= volume %>" />\r\n</div>';});

//  VolumeView represents the mute/unmute button as well as the volume slider.
//  Interacting with these controls will affect the muted state and volume of the YouTube player.
define('foreground/view/rightBasePane/volumeView',[
    'text!template/volume.html'
], function (VolumeTemplate) {
    'use strict';

    var VolumeView = Backbone.Marionette.ItemView.extend({
        className: 'volume clickable',
        template: _.template(VolumeTemplate),
        
        ui: {
            volumeSlider: '.volume-slider',
            //  Progress is the shading filler for the volumeRange's value.
            progress: '.progress',
            volumeRange: 'input.volume-range',
            muteButton: '#mute-button'
        },

        events: {
            'input @ui.volumeRange': '_setVolume',
            'click @ui.muteButton': '_toggleMute',
            'mousewheel': '_scrollVolume'
        },
       
        modelEvents: {
            'change:muted': '_toggleMutedClass',
            'change:volume': '_updateProgressAndVolumeIcon'
        },

        onRender: function () {
            var volumeIcon = this.getVolumeIcon(this.model.get('volume'));
            this.ui.muteButton.html(volumeIcon);
            
            this.$el.hoverIntent(this._expand.bind(this), this._collapse.bind(this), {
                sensitivity: 2,
                interval: 5500,
            });
        },
        
        _expand: function() {
            this.$el.data('oldheight', this.$el.height()).transition({
                height: 150
            }, 250, 'snap');

            this.ui.volumeSlider.removeClass('hidden');

            this.ui.volumeSlider.transition({
                opacity: 1
            }, 250, 'snap');
        },
        
        _collapse: function() {
            this.$el.transition({
                height: this.$el.data('oldheight')
            }, 250);

            this.ui.volumeSlider.transition({
                opacity: 0
            }, 250, function() {
                this.ui.volumeSlider.addClass('hidden');
            }.bind(this));
        },

        _setVolume: function () {
            var volume = parseInt(this.ui.volumeRange.val());
            this.model.set('volume', volume);
        },

        _updateProgressAndVolumeIcon: function () {
            var volume = parseInt(this.model.get('volume'));

            this.ui.volumeRange.val(volume);
            this.ui.progress.height(volume + '%');

            var volumeIcon = this.getVolumeIcon(volume);
            this.ui.muteButton.html(volumeIcon);
        },

        //  Return whichever font-awesome icon is appropriate based on the current volume level.
        getVolumeIcon: function (volume) {
            var volumeIconClass = 'off';

            if (volume > 50) {
                volumeIconClass = 'up';
            }
            else if (volume > 0) {
                volumeIconClass = 'down';
            }

            var volumeIcon = $('<i>', {
                'class': 'fa fa-volume-' + volumeIconClass
            });

            return volumeIcon;
        },

        //  Adjust volume when user scrolls mousewheel while hovering over volume.
        _scrollVolume: function (event) {
            var delta = event.originalEvent.wheelDeltaY / 120;
            var volume = parseInt(this.ui.volumeRange.val()) + (delta * 3);

            if (volume > 100) {
                volume = 100;
            }

            if (volume < 0) {
                volume = 0;
            }

            this.model.set('volume', volume);
        },

        _toggleMute: function () {
            var isMuted = this.model.get('muted');
            this.model.set('muted', !isMuted);
        },

        _toggleMutedClass: function () {
            var isMuted = this.model.get('muted');
            this.ui.muteButton.toggleClass('muted', isMuted);
        }
    });

    return VolumeView;
});
define('text!template/rightBasePane.html',[],function () { return '<div class="top-bar">\r\n    <div class="volume region"></div>\r\n\r\n    <div class="center-group">\r\n        <button id="previous-button" class="button-icon">\r\n            <i class="fa fa-backward fa-lg"></i> \r\n        </button>\r\n\r\n        <button id="play-pause-button" class="button-icon"></button>\r\n\r\n        <button id="next-button" class="button-icon">\r\n            <i class="fa fa-forward fa-lg"></i>\r\n        </button>\r\n    </div>\r\n    \r\n    <div class="streamus-menu region"></div>\r\n</div>\r\n\r\n<div class="time-progress region"></div>\r\n<div class="stream region"></div>';});

//  This view is intended to house all of the player controls (play, pause, etc) as well as the StreamView
define('foreground/view/rightBasePane/rightBasePaneView',[
    'common/enum/playerState',
    'foreground/view/rightBasePane/menuAreaView',
    'foreground/view/rightBasePane/streamView',
    'foreground/view/rightBasePane/timeProgressView',
    'foreground/view/rightBasePane/volumeView',
    'text!template/rightBasePane.html'
], function (PlayerState, MenuAreaView, StreamView, TimeProgressView, VolumeView, RightBasePaneTemplate) {
    'use strict';

    var StreamItems = Streamus.backgroundPage.StreamItems;
    var NextButton = Streamus.backgroundPage.NextButton;
    var PlayPauseButton = Streamus.backgroundPage.PlayPauseButton;
    var PreviousButton = Streamus.backgroundPage.PreviousButton;

    var RightBasePaneView = Backbone.Marionette.LayoutView.extend({
        id: 'right-base-pane',
        className: 'right-pane full flex-column',
        template: _.template(RightBasePaneTemplate),
        
        regions: {
            streamRegion: '.region.stream',
            timeProgressRegion: '.region.time-progress',
            volumeRegion: '.region.volume',
            streamusMenuRegion: '.region.streamus-menu'
        },
        
        events: {
            'click @ui.nextButton': '_tryActivateNextStreamItem',
            'click @ui.previousButton': '_tryDoTimeBasedPrevious',
            'click @ui.playPauseButton': '_tryTogglePlayerState'
        },
        
        modelEvents: {
            'change:state': '_setPlayPauseButtonState'
        },
        
        ui: {
            nextButton: '#next-button',
            previousButton: '#previous-button',
            playPauseButton: '#play-pause-button'
        },

        initialize: function () {
            this.listenTo(NextButton, 'change:enabled', this._setNextButtonDisabled);
            this.listenTo(PreviousButton, 'change:enabled', this._setPreviousButtonDisabled);
            this.listenTo(PlayPauseButton, 'change:enabled', this._setPlayPauseButtonState);
        },
        
        onRender: function () {
            this._setPlayPauseButtonState();
            this._setNextButtonDisabled();
            this._setPreviousButtonDisabled();
        },
        
        onShow: function () {
            this.streamRegion.show(new StreamView({
                collection: StreamItems
            }));

            this.timeProgressRegion.show(new TimeProgressView({
                model: this.model
            }));

            this.volumeRegion.show(new VolumeView({
                model: this.model
            }));

            //  TODO: Instead of MenuAreaView called it StreamusMenuAreaView for clarity.
            this.streamusMenuRegion.show(new MenuAreaView());
        },
        
        _tryActivateNextStreamItem: function () {
            //  Model is persistent to allow for easy rule validation when using keyboard shortcuts to control.
            NextButton.tryActivateNextStreamItem();
        },
        
        _tryDoTimeBasedPrevious: function() {
            PreviousButton.tryDoTimeBasedPrevious();
        },
        
        _tryTogglePlayerState: function () {
            PlayPauseButton.tryTogglePlayerState();
        },
        
        _setNextButtonDisabled: function () {
            this.ui.nextButton.toggleClass('disabled', !NextButton.get('enabled'));
        },
        
        _setPreviousButtonDisabled: function() {
            this.ui.previousButton.toggleClass('disabled', !PreviousButton.get('enabled'));
        },
        //  TODO: Instead of building HTML -- just set a class.
        _setPlayPauseButtonState: function() {
            var playerState = this.model.get('state');
            
            var icon;
            switch(playerState) {
                case PlayerState.Buffering:
                    icon = $('<div>', { 'class': 'spinner small' });
                    break;
                case PlayerState.Playing:
                    icon = $('<i>', { 'class': 'fa fa-lg fa-pause' });
                    break;
                default:
                    icon = $('<i>', { 'class': 'fa fa-lg fa-play' });
            }

            this.ui.playPauseButton.empty().append(icon);
            this.ui.playPauseButton.toggleClass('disabled', !PlayPauseButton.get('enabled'));
        }
    });

    return RightBasePaneView;
});
define('foreground/view/rightBasePane/rightBasePaneRegion',[
    'foreground/view/rightBasePane/rightBasePaneView'
], function (RightBasePaneView) {
    'use strict';
    
    var Player = Streamus.backgroundPage.YouTubePlayer;

    var RightBasePaneRegion = Backbone.Marionette.Region.extend({
        //  TODO: I am required to use ID selector here until bug resolved: https://github.com/marionettejs/backbone.marionette/issues/1530
        el: '#right-base-pane-region',
        
        initialize: function() {
            this.show(new RightBasePaneView({
                model: Player
            }));
        }
    });

    return RightBasePaneRegion;
});
define('foreground/view/foregroundView',[
    'foreground/view/contextMenuRegion',
    'foreground/view/leftBasePane/leftBasePaneRegion',
    'foreground/view/leftCoveringPane/leftCoveringPaneRegion',
    'foreground/view/notification/notificationRegion',
    'foreground/view/prompt/promptRegion',
    'foreground/view/rightBasePane/rightBasePaneRegion'
], function (ContextMenuRegion, LeftBasePaneRegion, LeftCoveringPaneRegion, NotificationRegion, PromptRegion, RightBasePaneRegion) {
    'use strict';

    //  Load variables from Background -- don't require because then you'll load a whole instance of the background when you really just want a reference to specific parts.
    var Player = Streamus.backgroundPage.YouTubePlayer;
    var Settings = Streamus.backgroundPage.Settings;
    var SignInManager = Streamus.backgroundPage.SignInManager;
    var TabManager = Streamus.backgroundPage.TabManager;

    var ForegroundView = Backbone.Marionette.LayoutView.extend({
        el: $('body'),

        events: {
            //  TODO: I think it might make more sense to use mousedown instead of click because dragging elements doesn't hide the contextmenu
            'click': function (event) {
                this.contextMenuRegion.handleClickEvent(event);
                this._announceClickedElement(event);
            },
            'contextmenu': function(event) {
                this.contextMenuRegion.handleClickEvent(event);
            }
        },

        regions: {
            promptRegion: PromptRegion,
            notificationRegion: NotificationRegion,
            //  Depends on the view, set during initialize.
            //contextMenuRegion: null,
            leftBasePaneRegion: LeftBasePaneRegion,
            leftCoveringPaneRegion: LeftCoveringPaneRegion,
            rightBasePaneRegion: RightBasePaneRegion
        },

        initialize: function () {
            this._checkPlayerReady();
            this.promptRegion.promptIfNeedGoogleSignIn();
            this.promptRegion.promptIfNeedLinkUserId();
            this.promptRegion.promptIfUpdateAvailable();
            this._setContextMenuRegion();

            this.listenTo(Settings, 'change:showTooltips', this._setHideTooltipsClass);
            this._setHideTooltipsClass();

            this.listenTo(Player, 'change:state', this._setPlayerStateClass);
            this._setPlayerStateClass();

            //  Automatically sign the user in once they've actually interacted with Streamus.
            //  Don't sign in when the background loads because people who don't use Streamus, but have it installed, will bog down the server.
            SignInManager.signInWithGoogle();

            //  Destroy the foreground to perform memory management / unbind event listeners. Memory leaks will be introduced if this doesn't happen.
            $(window).unload(this.destroy.bind(this));
            
            if (Settings.get('alwaysOpenInTab')) {
                TabManager.showStreamusTab();
            }
        },
        
        _setContextMenuRegion: function () {
            this.contextMenuRegion = new ContextMenuRegion({
                containerHeight: this.$el.height(),
                containerWidth: this.$el.width()
            });
        },

        //  Announce the jQuery target of element clicked so multi-select collections can decide if they should de-select their child views
        //  and so that menus can close if they weren't clicked.
        _announceClickedElement: function (event) {
            Backbone.Wreqr.radio.channel('global').vent.trigger('clickedElement', $(event.target));
        },
        
        //  Keep the player state represented on the body so CSS can easily reflect the state of the Player.
        _setPlayerStateClass: function () {
            this.$el.toggleClass('playing', Player.isPlaying());
        },
        
        //  Use some CSS to hide tooltips instead of trying to unbind/rebind all the event handlers.
        _setHideTooltipsClass: function () {
            this.$el.toggleClass('hide-tooltips', !Settings.get('showTooltips'));
        },
        
        //  Check if the YouTube player is loaded. If it isn't, place the UI into a loading state.
        _checkPlayerReady: function() {
            if (!Player.get('ready')) {
                this._startLoading();
            }
        },

        //  Give the program a few seconds before prompting the user to try restarting Streamus.
        _startLoading: function () {
            this.$el.addClass('loading');
            this.promptRegion.startShowReloadPromptTimer();
            this.listenToOnce(Player, 'change:ready', this._stopLoading);
        },
        
        //  Set the foreground's view state to indicate that user interactions are OK once the player is ready.
        _stopLoading: function () {
            this.$el.removeClass('loading');
            this.promptRegion.hideReloadStreamusPrompt();
        }
    });

    //  Only could ever possibly want 1 of these views... there's only 1 foreground.
    return new ForegroundView();
});