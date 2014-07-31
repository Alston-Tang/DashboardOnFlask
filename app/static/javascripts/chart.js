CharSet= {
    pie: function (dom,opt) {
        var width = dom.offsetWidth;
        var jsonData=opt.jsonData?opt.jsonData:null;

        var radius = width / 2 - 10;

        var hue = d3.scale.category10();

        var luminance = d3.scale.sqrt()
            .domain([0, 1e6])
            .clamp(true)
            .range([90, 20]);

        var svg = d3.select(dom).append("svg")
            .attr("width", width)
            .attr("height", width)
            .attr("class", "pieChart")
            .append("g")
            .attr("transform", "translate(" + radius + "," + radius + ")");

        var partition = d3.layout.partition()
            .sort(function (a, b) {
                return d3.ascending(a.name, b.name);
            })
            .size([2 * Math.PI, radius]);

        var arc = d3.svg.arc()
            .startAngle(function (d) {
                return d.x;
            })
            .endAngle(function (d) {
                return d.x + d.dx - .01 / (d.depth + .5);
            })
            .innerRadius(function (d) {
                return radius / 3 * d.depth;
            })
            .outerRadius(function (d) {
                return radius / 3 * (d.depth + 1) - 1;
            });


        // Compute the initial layout on the entire tree to sum sizes.
        // Also compute the full name and fill color for each node,
        // and stash the children so they can be restored as we descend.
        var root = jsonData;
        partition
            .value(function (d) {
                return d.size;
            })
            .nodes(root)
            .forEach(function (d) {
                d._children = d.children;
                d.sum = d.value;
                d.key = key(d);
                d.fill = fill(d);
            });

        // Now redefine the value function to use the previously-computed sum.
        partition
            .children(function (d, depth) {
                return depth < 2 ? d._children : null;
            })
            .value(function (d) {
                return d.sum;
            });

        var center = svg.append("circle")
            .attr("r", radius / 3)
            .on("click", zoomOut);

        center.append("title")
            .text("zoom out");

        var path = svg.selectAll("path")
            .data(partition.nodes(root).slice(1))
            .enter().append("path")
            .attr("d", arc)
            .style("fill", function (d) {
                return d.fill;
            })
            .each(function (d) {
                this._current = updateArc(d);
            })
            .on("click", zoomIn);

        function zoomIn(p) {
            if (p.depth > 1) p = p.parent;
            if (!p.children) return;
            zoom(p, p);
        }

        function zoomOut(p) {
            if (!p.parent) return;
            zoom(p.parent, p);
        }

        // Zoom to the specified new root.
        function zoom(root, p) {
            if (document.documentElement.__transition__) return;

            // Rescale outside angles to match the new layout.
            var enterArc,
                exitArc,
                outsideAngle = d3.scale.linear().domain([0, 2 * Math.PI]);

            function insideArc(d) {
                return p.key > d.key
                    ? {depth: d.depth - 1, x: 0, dx: 0} : p.key < d.key
                    ? {depth: d.depth - 1, x: 2 * Math.PI, dx: 0}
                    : {depth: 0, x: 0, dx: 2 * Math.PI};
            }

            function outsideArc(d) {
                return {depth: d.depth + 1, x: outsideAngle(d.x), dx: outsideAngle(d.x + d.dx) - outsideAngle(d.x)};
            }

            center.datum(root);

            // When zooming in, arcs enter from the outside and exit to the inside.
            // Entering outside arcs start from the old layout.
            if (root === p) enterArc = outsideArc, exitArc = insideArc, outsideAngle.range([p.x, p.x + p.dx]);

            path = path.data(partition.nodes(root).slice(1), function (d) {
                return d.key;
            });

            // When zooming out, arcs enter from the inside and exit to the outside.
            // Exiting outside arcs transition to the new layout.
            if (root !== p) enterArc = insideArc, exitArc = outsideArc, outsideAngle.range([p.x, p.x + p.dx]);

            d3.transition().duration(d3.event.altKey ? 7500 : 750).each(function () {
                path.exit().transition()
                    .style("fill-opacity", function (d) {
                        return d.depth === 1 + (root === p) ? 1 : 0;
                    })
                    .attrTween("d", function (d) {
                        return arcTween.call(this, exitArc(d));
                    })
                    .remove();

                path.enter().append("path")
                    .style("fill-opacity", function (d) {
                        return d.depth === 2 - (root === p) ? 1 : 0;
                    })
                    .style("fill", function (d) {
                        return d.fill;
                    })
                    .on("click", zoomIn)
                    .each(function (d) {
                        this._current = enterArc(d);
                    });

                path.transition()
                    .style("fill-opacity", 1)
                    .attrTween("d", function (d) {
                        return arcTween.call(this, updateArc(d));
                    });
            });
        }

        function key(d) {
            var k = [], p = d;
            while (p.depth) k.push(p.name), p = p.parent;
            return k.reverse().join(".");
        }

        function fill(d) {
            var p = d;
            while (p.depth > 1) p = p.parent;
            var c = d3.lab(hue(p.name));
            c.l = luminance(d.sum);
            return c;
        }

        function arcTween(b) {
            var i = d3.interpolate(this._current, b);
            this._current = i(0);
            return function (t) {
                return arc(i(t));
            };
        }

        function updateArc(d) {
            return {depth: d.depth, x: d.x, dx: d.dx};
        }

        //d3.select(self.frameElement).style("height", margin.top + margin.bottom + "px");

    },


    area: function (dom, opt) {
        var domMargin=opt.margin?opt.margin:0;
        var jsonData=opt.jsonData?opt.jsonData:null;

        var margin = {top: 20, right: 20, bottom: 30, left: 50},
            width = dom.offsetWidth - domMargin - margin.left - margin.right,
            height = width * 0.52 - margin.top - margin.bottom;

        var parseDate = d3.time.format("%d-%b-%y").parse;

        var x = d3.time.scale()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var area = d3.svg.area()
            .x(function (d) {
                return x(d.date);
            })
            .y0(height)
            .y1(function (d) {
                return y(d.close);
            });

        var svg = d3.select(dom).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("class", 'areaChart')
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var data=jsonData;
        data.forEach(function (d) {
            d.date = parseDate(d.date);
            d.close = +d.close;
        });

        x.domain(d3.extent(data, function (d) {
            return d.date;
        }));
        y.domain([0, d3.max(data, function (d) {
            return d.close;
        })]);

        svg.append("path")
            .datum(data)
            .attr("class", "area")
            .attr("d", area);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Price ($)");
    },

    area_test: function (dom, opt) {
        var domMargin=opt.margin?opt.margin:0;
        var json_date=opt.jsonDate?opt.jsonDate:null;

        var margin = {top: 20, right: 20, bottom: 30, left: 50},
            width = dom.offsetWidth - domMargin - margin.left - margin.right,
            height = width * 0.52 - margin.top - margin.bottom;

        var parseDate = d3.time.format("%d-%b-%y").parse;

        var x = d3.time.scale()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var area = d3.svg.area()
            .x(function (d) {
                return x(d.date);
            })
            .y0(height)
            .y1(function (d) {
                return y(d.close);
            });

        var svg = d3.select(dom).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("class", 'areaChart')
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        d3.tsv("static/testData/test.tsv", function (error, data) {
            data.forEach(function (d) {
                d.date = parseDate(d.date);
                d.close = +d.close;
            });

            x.domain(d3.extent(data, function (d) {
                return d.date;
            }));
            y.domain([0, d3.max(data, function (d) {
                return d.close;
            })]);

            svg.append("path")
                .datum(data)
                .attr("class", "area")
                .attr("d", area);

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Price ($)");
        });
    }
};