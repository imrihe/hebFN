
function basename(path) {
    return path.replace(/\\/g, '/').replace(/.*\//, '');
}
if (!Array.prototype.shuffle) {
    Array.prototype.shuffle = function() {
        for (var i = 0; i < this.length; i++) {
            var j = Math.floor(Math.random() * this.length);
            if (i != j) {
                var contents = this[i];
                this[i] = this[j];
                this[j] = contents;
            }
        }
    };
}
function FNLexUnit() {
    var $ = jQuery;
    var luDoc;
    var luNode;
    this.numberSentences = function numberSentences() {
        var sentNumber = 0;
        $(luNode).find("sentence").each(function() {
            sentNumber++;
            $(this).attr("fnxID", sentNumber);
        });
    };
    this.toXMLString = function toXMLString(xmlNode) {
        try {
            return (new XMLSerializer()).serializeToString(xmlNode);
        }
        catch (e) {
            try {
                return xmlNode.xml;
            }
            catch (e) {
                alert('XML Serializer not supported');
            }
        }
        return false;
    };
    this.getXMLString = function getXMLString() {
        return this.toXMLString(luNode);
    };
    this.loadXMLResponse = function loadXMLResponse(xmldata) {
        var msg = $(xmldata).find('error-message').text();
        if (msg) {
            alert("Error: " + msg);
            return false;
        } else {
            luDoc = xmldata;
            luNode = $(xmldata).find("lexUnit").get(0);
            this.numberSentences();
            return true;
        }
    };
    this.loadDemoXMLResponse = function loadDemoXMLResponse(xmldata) {
        var msg = $(xmldata).find('error-message').text();
        if (msg) {
            alert("Error: " + msg);
            return false;
        } else {
            luDoc = xmldata;
            luNode = $(xmldata).find("lexUnit").get(0);
            var lookForMatched = true;
            var lookForUnmatched = true;
            $(luNode).find("subCorpus").each(function() {
                if (lookForMatched && $(this).attr('name').match(/other-matched/)) {
                    lookForMatched = false;
                    $(this).attr('name', '01-unannotated-1');
                } else if (lookForUnmatched && $(this).attr('name').match(/other-unmatched/)) {
                    lookForUnmatched = false;
                    $(this).attr('name', '02-unannotated-2');
                } else {
                    $(this).remove();
                }
            });
            $(luNode).find("valences").remove();
            $(luNode).find('sentence:has(annotationSet[status="MANUAL"])').remove();
            this.numberSentences();
            return true;
        }
    };
    this.loadXMLString = function loadXMLString(xmlStr) {
        luDoc = $.parseXML(xmlStr);
        luNode = $(luDoc).find("lexUnit").get(0);
        this.numberSentences();
    };
    this.loadNode = function loadNode(xmlNode) {
        luNode = xmlNode;
    };
    this.loadFile = function loadFile(fileName) {
        $.ajax({type: "GET",url: fileName,dataType: "xml",async: false,success: function(xmldata) {
            luDoc = xmldata;
            luNode = $(xmldata).find("lexUnit").get(0);
            this.numberSentences();
        }});
    };
    this.retrieve = function retrieve() {
        $.ajax({type: "POST",url: "fnxml.php",data: {"operation": "GetXML"},dataType: "xml",async: false,success: function(xmldata) {
            luDoc = xmldata;
            luNode = $(xmldata).find("lexUnit").get(0);
            this.numberSentences();
        }});
    };
    this.save = function save(name, mode) {
        var savenode = $(luNode).clone().get(0);
        $(savenode).find("sentence").removeAttr("fnxID");
        $.ajax({type: "POST",url: "fnxml.php",data: {"operation": "SaveXML","name": encodeURIComponent(name),"XMLData": encodeURIComponent(this.toXMLString(savenode))},dataType: "xml",processData: "false",async: true,success: function(xmldata) {
            var errorMsg = $(xmldata).find('error-message').text();
            if (errorMsg) {
                alert("Error: " + errorMsg);
            } else {
                var saveId = $(xmldata).find('saveId').text();
                var title = name;
                if (mode == 'preview') {
                    title = 'Preview ' + name;
                }
                var args = "op=" + mode + "&id=" + saveId + "&filename=" + encodeURIComponent(name);
                window.open("getfnxml.php?" + args, title, "");
            }
        }});
    }
    this.attr = function attr(attrName) {
        return $(luNode).attr(attrName);
    };
    this.getSentences = function getSentences() {
        var sents = [];
        $(luNode).find("sentence").each(function() {
            sents[$(this).attr("fnxID")] = $(this).children("text").first().text();
        });
        return sents;
    };
    this.getSubCorpusNames = function getSubCorpusNames() {
        var scs = [];
        $(luNode).find("subCorpus").each(function() {
            scs.push($(this).attr("name"));
        });
        return scs;
    };
    this.getSentencesBySubCorpus = function getSentencesBySubCorpus(scname) {
        var sents = [];
        $(luNode).find("subCorpus[name='" + scname + "'] > sentence").each(function() {
            sents.push(new FNSentence($(this).get(0)));
        });
        return sents;
    };
    this.getSentencesBySubCorpusNoFEs = function getSentencesBySubCorpusNoFEs(scname) {
        var sents = [];
        $(luNode).find("subCorpus[name='" + scname + "'] > sentence").each(function() {
            if ($(this).find('layer[name="FE"] > label').length == 0) {
                sents.push(new FNSentence($(this).get(0)));
            }
        });
        return sents;
    };
    this.getAnnotatedSentencesByFE = function getAnnotatedSentencesByFE(labelname) {
        var sents = [];
        $(luNode).find("sentence layer[name='FE'] > label[name='" + labelname + "']").parents("sentence").each(function() {
            sents.push(new FNSentence($(this).get(0)));
        });
        return sents;
    };
    this.getAnnotatedSentencesByFEs = function getAnnotatedSentencesByFEs(fes) {
        var sentsA = [], sentsB = [], sentHash = {}, filterbuf = [];
        $.each(fes, function(i, fename) {
            filterbuf[filterbuf.length] = ':has(label[name="';
            filterbuf[filterbuf.length] = fename;
            filterbuf[filterbuf.length] = '"])';
        });
        $(luNode).find('sentence').filter(filterbuf.join("")).each(function() {
            var sent = new FNSentence($(this).get(0)), id = sent.getId();
            sentsA.push(sent);
            sentHash[id] = 1;
        });
        $.each(fes, function(i, fename) {
            $(luNode).find('sentence layer[name="FE"] > label[name="' + fename + '"]').parents('sentence').each(function() {
                var sent = new FNSentence($(this).get(0)), id = sent.getId();
                if (sentHash[id]) {
                } else {
                    sentsB.push(sent);
                    sentHash[id] = 1;
                }
            });
        });
        sentsB.shuffle();
        return sentsA.concat(sentsB);
    };
    this.getSentence = function getSentence(id) {
        return $(luNode).find("sentence[fnxID='" + id + "']").get(0);
    };
    this.getFELabelNames = function getFELabelNames() {
        var fes = new [];
        $(luNode).find("header > frame > FE").each(function() {
            fes.push($(this).attr('name'));
        });
        return fes;
    };
    this.getSelectedFEHeaders = function getSelectedFEHeaders() {
        var fes = [];
        $(luNode).find('header FE[isSelected="true"]').each(function() {
            var fe = {};
            fe.name = $(this).attr('name');
            fe.group = $(this).attr('inGroup');
            fe.exIds = $(this).attr('exIds');
            fes.push(fe);
        });
        return fes;
    };
    this.getSelectedSCNames = function getSelectedSCNames() {
        var scs = [], scstr;
        scstr = $(luNode).find('subCorpus[name="sentences"]').attr('selectedSCs');
        if (scstr) {
            scs = scstr.split(":");
        }
        return scs;
    };
    this.getSelectedExamplesByFE = function getSelectedExamplesByFE(fename) {
        var sents = [], ids = [], i;
        ids = $(luNode).find('header FE[name="' + fename + '"]').attr("exampleIds").split(":");
        for (i = 0; i < ids.length; i += 1) {
            sents.push(new FNSentence($(luNode).find('subCorpus[name="examples"] > sentence[fnxID="'
                + ids[i] + '"]').get(0)));
        }
        return sents;
    };
    this.getSelectedSentences = function getSelectedSentences() {
        var sents = [];
        $(luNode).find('subCorpus[name="sentences"] > sentence').each(function() {
            sents.push(new FNSentence($(this).get(0)));
        });
        return sents;
    };
    this.getFELabelColor = function getFELabelColor(fe) {
        var buf = [];
        buf[buf.length] = fe;
        buf[buf.length] = "_col=";
        $(luNode).find('header > frame > FE[name="' + fe + '"]').each(function() {
            buf[buf.length] = $(this).attr('fgColor');
            buf[buf.length] = ":";
            buf[buf.length] = $(this).attr('bgColor');
        });
        return buf.join("");
    };
    this.getFELabelColorStyle = function getFELabelColorStyle() {
        var styleBuffer = [];
        $(luNode).find("header > frame > FE").each(function() {
            styleBuffer[styleBuffer.length] = ".label-FE-";
            styleBuffer[styleBuffer.length] = $(this).attr('name');
            styleBuffer[styleBuffer.length] = " {";
            styleBuffer[styleBuffer.length] = "color: #";
            styleBuffer[styleBuffer.length] = $(this).attr('fgColor');
            styleBuffer[styleBuffer.length] = "; ";
            styleBuffer[styleBuffer.length] = "background: #";
            styleBuffer[styleBuffer.length] = $(this).attr('bgColor');
            styleBuffer[styleBuffer.length] = "; ";
            styleBuffer[styleBuffer.length] = "}\n";
        });
        return styleBuffer.join("");
    };
    this.getFELabelColorRules = function getFELabelColorRules() {
        var rules = [];
        $(luNode).find("header > frame > FE").each(function() {
            var rule = {}, styleBuffer = [];
            styleBuffer[styleBuffer.length] = "color: #";
            styleBuffer[styleBuffer.length] = $(this).attr('fgColor');
            styleBuffer[styleBuffer.length] = "; ";
            styleBuffer[styleBuffer.length] = "background: #";
            styleBuffer[styleBuffer.length] = $(this).attr('bgColor');
            styleBuffer[styleBuffer.length] = "; ";
            rule.selector = ".label-FE-" + $(this).attr("name");
            rule.styleDef = styleBuffer.join("");
            rules[rules.length] = rule;
        });
        return rules;
    };
    this.injectLabelColorStyleSheet = function injectLabelColorStyleSheet() {
        var ss = document.createElement('style'), ssid = "FELabelColors_" + this.attr("frame"), rules;
        ss.setAttribute("id", ssid);
        ss.setAttribute("type", "text/css");
        rules = this.getFELabelColorStyle();
        if ($.browser.msie && parseInt($.browser.version) < 9) {
            ss.styleSheet.cssText = rules;
        } else {
            $(ss).html(this.getFELabelColorStyle());
        }
        $('head').append($(ss));
        return ssid;
    };
    this.getCoreFELabelNames = function getCoreFELabelNames() {
        var fes = [];
        $(luNode).find("header > frame > FE[type^='Core']").each(function() {
            fes.push($(this).attr('name'));
        });
        return fes;
    };
    this.getNonCoreFELabelNames = function getNonCoreFELabelNames() {
        var fes = [];
        $(luNode).find("header > frame > FE:not([type^='Core'])").each(function() {
            fes.push($(this).attr('name'));
        });
        return fes;
    };
}
function FNSentence(sentNode) {
    var $ = jQuery;
    var sentXML = sentNode;
    var annoSet = $(sentXML).find("annotationSet:has(label[name='Target']):first");
    var NIMode = "default";
    var showLabelsAsTT = false;
    this.setSimpleNIMode = function setSimpleNIMode() {
        NIMode = "simple";
    };
    this.getText = function getText() {
        return $(sentXML).children("text").first().text();
    };
    this.getId = function getId() {
        return $(sentXML).attr("fnxID");
    }
    this.showLabelTTs = function() {
        showLabelsAsTT = true;
    };
    this.getLabels = function getLabels(layer) {
        var labels = [];
        $(annoSet).find("layer[name='" + layer + "'] > label").each(function() {
            var label = {};
            label.layer = layer;
            label.name = $(this).attr("name");
            if (typeof $(this).attr("itype") == "undefined") {
                label.start = parseInt($(this).attr("start"));
                label.end = parseInt($(this).attr("end"));
            } else {
                label.itype = $(this).attr("itype");
            }
            labels.push(label);
        });
        return labels;
    }
    this.renderSentence = function renderSentence(layers, labels) {
        var labFilter = {};
        i;
        if (typeof labels == 'undefined') {
            labFilter = null;
        } else {
            for (i = 0; i < labels.length; i += 1) {
                labFilter[labels[i]] = 1;
            }
        }
        var text = this.getText();
        var indexInsert = new Array(text.length + 1);
        for (var i = 0; i < indexInsert.length; i++) {
            indexInsert[i] = "";
        }
        var niText = "";
        for (var l = 0; l < layers.length; l++) {
            var layer = layers[l];
            var labs = this.getLabels(layer);
            var spanPre = '<span class="label-' + layer + '-';
            var itypelab;
            innerloop: for (i = 0; i < labs.length; i += 1) {
                if (labFilter != null) {
                    if (!labFilter[labs[i].name]) {
                        continue innerloop;
                    }
                }
                if ('itype' in labs[i]) {
                    if (NIMode == "simple") {
                        itypelab = '(missing)';
                    } else {
                        itypelab = labs[i].itype;
                    }
                    niText += " " + spanPre + labs[i].name + '"';
                    if (showLabelsAsTT) {
                        niText += ' title="' + labs[i].name + '"';
                    }
                    niText += '>' + itypelab + '</span>';
                } else {
                    indexInsert[labs[i].start] += spanPre + labs[i].name + '"';
                    if (showLabelsAsTT) {
                        indexInsert[labs[i].start] += ' title="' + labs[i].name + '"';
                    }
                    indexInsert[labs[i].start] += '>';
                    indexInsert[labs[i].end + 1] = '</span>' + indexInsert[labs[i].end + 1];
                }
            }
        }
        var rTextBuffer = new Array(text.length + indexInsert.length + 1);
        for (var i = 0; i < text.length; i++) {
            var j = 2 * i;
            rTextBuffer[j] = indexInsert[i];
            rTextBuffer[j + 1] = text.charAt(i);
        }
        rTextBuffer[rTextBuffer.length - 2] = indexInsert[text.length];
        rTextBuffer[rTextBuffer.length - 1] = niText;
        return rTextBuffer.join("");
    };
    this.deleteLabel = function deleteLabel(layer, start, end, name) {
        if (layer == 'Target' && name == 'Target') {
            alert("Cannot delete 'Target' label.");
            return;
        }
        $(annoSet).find("layer[name='" + layer + "'] > label[start='" + start + "'][end='" + end + "'][name='" + name + "']").remove();
        this.changeStatus();
    };
    this.deleteNILabel = function deleteNILabel(layer, name) {
        if (layer == 'FE') {
            $(annoSet).find("layer[name='" + layer + "'] > label[itype][name='" + name + "']").remove();
            this.changeStatus();
        }
    }
    this.createLabel = function createLabel(layer, start, end, name) {
        var $labelNode, $layerNode, noOverlaps = true;
        if (start < 0 || end < 0) {
            return false;
        }
        $layerNode = $(annoSet).find("layer[name='" + layer + "']").first();
        $layerNode.children("label").each(function() {
            var lstart = parseInt($(this).attr('start')), lend = parseInt($(this).attr('end'));
            if ((start >= lstart && start <= lend) || (end >= lstart && end <= lend)) {
                alert("Label creation failed: conflict with existing label '" + $(this).attr('name') + "' [" + lstart + "," + lend + "].");
                noOverlaps = false;
            }
        });
        if (noOverlaps == true) {
            $labelNode = $(annoSet).find('label[name="Target"]').clone();
            $labelNode.attr('name', name).attr('start', start).attr('end', end).removeAttr('cBy');
            $layerNode.append($labelNode);
            this.changeStatus();
        }
    };
    this.createNILabel = function createNILabel(layer, itype, name) {
        var layerNode, labelNodes, labelCreated = false;
        that = this;
        if (layer != "FE") {
            return false;
        }
        if (itype != "CNI" && itype != "DNI" && itype != "INI") {
            return false;
        }
        layerNode = $(annoSet).find("layer[name='" + layer + "']").first();
        labelNodes = layerNode.children("label[name='" + name + "']");
        if (labelNodes.length > 0) {
            labelNodes.each(function() {
                if ($(this).attr("itype").match(/^(I|C|D)NI$/) != null && $(this).attr("itype") != itype) {
                    $(this).attr("itype", itype);
                    that.changeStatus();
                    labelCreated = true;
                    return false;
                }
            });
            if (!labelCreated) {
                alert("Label creation failed: conflict with existing label with name '" + name + "'.");
            }
        } else {
            labelNode = $(annoSet).find('label[name="Target"]').clone();
            labelNode.attr('name', name);
            labelNode.attr('itype', itype);
            labelNode.removeAttr('start');
            labelNode.removeAttr('end');
            labelNode.removeAttr('cBy');
            layerNode.append(labelNode);
            this.changeStatus();
        }
    };
    this.changeStatus = function changeStatus() {
        $(annoSet).attr('status', 'MANUAL');
    };
}
function FNSelectionManager(charspans, base) {
    var $ = jQuery;
    this.start = -1;
    this.end = -1;
    this.inProgress = false;
    this.selectByWord = true;
    this.snapToLabels = true;
    this.labelPrefix = 'label-';
    this.allLabelRE = new RegExp('\\b' + this.labelPrefix + '\\w+-\\w+\\b', 'g');
    this.currentLayer = "FE";
    this.labelRE = new RegExp('\\b' + this.labelPrefix + this.currentLayer + '\\w+-\\w+\\b', 'g');
    var cspans = charspans;
    var $b = $(base);
    this.setLayer = function setLayer(layer) {
        this.currentLayer = layer;
        this.labelRE = new RegExp('\\b' + this.labelPrefix + layer + '-\\w+\\b', 'g');
    }
    this.genLabelClass = function genLabelClass(layer, label) {
        return this.labelPrefix + layer + "-" + label;
    }
    this.isSpace = function isSpace(char) {
        if (char == ' ') {
            return true;
        } else {
            return false;
        }
    }
    this.getCharIndex = function getCharIndex(idString) {
        if (typeof idString == 'string') {
            var idParts = idString.split(':');
            return parseInt(idParts[2]);
        } else {
            return -1;
        }
    }
    this.getStart = function getStart() {
        return this.start;
    }
    this.getEnd = function getEnd() {
        return this.end;
    }
    this.markEdgeClasses = function markEdgeClasses(type) {
        $b.find('.selecting_left').removeClass('selecting_left');
        $b.find('.selecting_right').removeClass('selecting_right');
        $b.find('.selected_left').removeClass('selected_left');
        $b.find('.selected_right').removeClass('selected_right');
        if (this.start < this.end) {
            $(cspans[this.start]).addClass(type + "_left");
            $(cspans[this.end]).addClass(type + "_right");
        } else {
            $(cspans[this.end]).addClass(type + "_left");
            $(cspans[this.start]).addClass(type + "_right");
        }
        this.postStatus();
    }
    this.fixSelection = function fixSelection() {
        var labels, label = null, labelPt, i, direction = 1, increment = 1, inc_unit = 1, labelSnapped = false, scan_i, scan_end;
        if (this.end < this.start) {
            direction = -1;
        }
        increment = inc_unit * direction;
        if (this.snapToLabels) {
            scan_end = direction * this.end;
            for (scan_i = this.start * direction; scan_i <= scan_end; scan_i += inc_unit) {
                i = scan_i * direction;
                labels = $(cspans[i]).attr('class').match(this.labelRE);
                if (labels != null && labels.length > 0) {
                    label = labels[0];
                    labelPt = i;
                    break;
                }
            }
            if (label != null) {
                this.clear();
                this.inProgress = true;
                for (i = labelPt; i > 0; i -= 1) {
                    if ($(cspans[i]).hasClass(label)) {
                        this.start = i;
                        $(cspans[i]).addClass('selected');
                    } else {
                        break;
                    }
                }
                for (i = labelPt; i < cspans.length; i += 1) {
                    if ($(cspans[i]).hasClass(label)) {
                        this.end = i;
                        $(cspans[i]).addClass('selected');
                    } else {
                        break;
                    }
                }
                this.inProgress = false;
                this.markEdgeClasses('selected');
                labelSnapped = true;
            }
        }
        if (this.start == this.end && this.isSpace($(cspans[this.start]).html())) {
            if (this.inProgress) {
                this.markEdgeClasses("selecting");
                return;
            } else {
                this.clear();
                return;
            }
        }
        if (this.selectByWord && !labelSnapped) {
            while (this.isSpace($(cspans[this.start]).html()) && this.start > 0 && this.start < cspans.length) {
                $(cspans[this.start]).removeClass('selecting');
                this.start += increment;
            }
            while (this.start - increment >= 0 && this.start - increment < cspans.length && !this.isSpace($(cspans[this.start - increment]).html())) {
                this.start -= increment;
                $(cspans[this.start]).addClass('selecting');
            }
            while (this.isSpace($(cspans[this.end]).html()) && this.end > 0 && this.end < cspans.length) {
                $(cspans[this.end]).removeClass('selecting');
                this.end -= increment;
            }
            while (this.end + increment >= 0 && this.end + increment < cspans.length && !this.isSpace($(cspans[this.end + increment]).html())) {
                this.end += increment;
                $(cspans[this.end]).addClass('selecting');
            }
            this.markEdgeClasses('selecting');
        }
    }
    this.sealSelection = function sealSelection() {
        if (this.inProgress) {
            this.inProgress = false;
            this.fixSelection();
            $b.find('.selecting').addClass('selected');
            $b.find('.selected').removeClass('selecting');
            this.markEdgeClasses('selected');
        }
    };
    this.setEnd = function setEnd(cspanId) {
        if (this.inProgress) {
            this.end = this.getCharIndex(cspanId);
            this.sealSelection();
        }
    };
    this.setStart = function setStart(cspanId) {
        this.clear();
        this.start = this.getCharIndex(cspanId);
        this.end = this.start;
        $(cspans[this.start]).addClass("selecting");
        this.inProgress = true;
        this.fixSelection();
    };
    this.hasLabel = function hasLabel(pt) {
        if ($(cspans[pt]).attr('class').match(this.labelRE)) {
            return true;
        } else {
            return false;
        }
    };
    this.getLayerLabel = function getLayerLabel(pt) {
        var labels = $(cspans[pt]).attr('class').match(this.labelRE), pair = [];
        if (labels.length < 1) {
            return null;
        } else {
            var parts = labels[0].split('-');
            pair[0] = parts[1];
            pair[1] = parts[2];
        }
        return pair;
    };
    this.growTo = function growTo(pt) {
        if (this.hasLabel(this.start)) {
            return;
        }
        var left = this.start;
        var right = this.end;
        if (this.end < this.start) {
            left = this.end;
            right = this.start;
        }
        if (pt < left) {
            left = pt;
        } else if (pt > right) {
            right = pt;
        }
        this.clear();
        this.setStart($(cspans[left]).attr('id'));
        this.extendTo($(cspans[right]).attr('id'));
        this.setEnd($(cspans[right]).attr('id'));
    };
    this.extendTo = function extendTo(cspanId) {
        if (this.inProgress) {
            this.end = this.getCharIndex(cspanId);
            if (this.end > this.start) {
                for (var i = 0; i < cspans.length; i++) {
                    if (i >= this.start && i <= this.end) {
                        $(cspans[i]).addClass('selecting');
                    } else {
                        $(cspans[i]).removeClass('selecting');
                    }
                }
            } else {
                for (var i = 0; i < cspans.length; i++) {
                    if (i >= this.end && i <= this.start) {
                        $(cspans[i]).addClass('selecting');
                    } else {
                        $(cspans[i]).removeClass('selecting');
                    }
                }
            }
            this.fixSelection();
        }
    };
    this.clear = function clear() {
        this.inProgress = false;
        this.start = -1;
        this.end = -1;
        $b.find('.selecting').removeClass('selecting');
        $b.find('.selected').removeClass('selected');
        $b.find('.selecting_left').removeClass('selecting_left');
        $b.find('.selecting_right').removeClass('selecting_right');
        $b.find('.selected_left').removeClass('selected_left');
        $b.find('.selected_right').removeClass('selected_right');
        this.postStatus();
    };
    this.getLeftwardPoint = function getLeftwardPoint() {
        if (this.start < 0) {
            return cspans.length - 1;
        } else {
            var point = this.start;
            if (this.end < point) {
                point = this.end;
            }
            while (point - 1 >= 0 && this.isSpace($(cspans[point - 1]).html())) {
                point--;
            }
            if (point > 0) {
                point--;
            }
            return point;
        }
    };
    this.getRightwardPoint = function getRightwardPoint() {
        if (this.start < 0) {
            return 0;
        } else {
            var point = this.end;
            if (this.start > this.end) {
                point = this.start;
            }
            while (point + 1 < cspans.length && this.isSpace($(cspans[point + 1]).html())) {
                point++;
            }
            if (point < cspans.length - 1) {
                point++;
            }
            return point;
        }
    };
    this.moveLeft = function moveLeft() {
        var pt = this.getLeftwardPoint();
        if ((pt < this.start && pt < this.end) || (pt >= 0 && this.start < 0 && this.end < 0)) {
            this.setStart($(cspans[pt]).attr('id'));
            this.setEnd($(cspans[pt]).attr('id'));
        }
    };
    this.moveRight = function moveRight() {
        var pt = this.getRightwardPoint();
        if (pt > this.end && pt > this.start) {
            this.setStart($(cspans[pt]).attr('id'));
            this.setEnd($(cspans[pt]).attr('id'));
        }
    };
    this.growLeft = function growLeft() {
        if (this.start >= 0 && this.end >= 0) {
            var pt = this.getLeftwardPoint();
            this.growTo(pt);
        }
    };
    this.growRight = function growRight() {
        if (this.start >= 0 && this.end >= 0) {
            var pt = this.getRightwardPoint();
            this.growTo(pt);
        }
    };
    this.postStatus = function postStatus() {
        if (this.start == -1 || this.end == -1) {
            $('#StatusBar_CoordSpan').html("[,] ");
            $('#StatusLabel').remove();
            $('#deleteLabelButton').css('display', 'none');
        } else {
            $('#StatusBar_CoordSpan').html("[" + this.start + "," + this.end + "] ");
            if (this.hasLabel(this.start)) {
                var pair = this.getLayerLabel(this.start);
                $('#StatusLabel').remove();
                var span = document.createElement('span');
                $(span).attr('id', 'StatusLabel');
                $(span).html(pair[1]);
                $(span).addClass(this.genLabelClass(pair[0], pair[1]));
                $('#StatusBar').append($(span));
                if (pair[0] != 'Target') {
                    $('#StatusBar').append(' ');
                    $('#deleteLabelButton').css('display', 'inline');
                    $('#StatusBar').append($('#deleteLabelButton'));
                }
            } else {
                $('#StatusLabel').remove();
                $('#deleteLabelButton').css('display', 'none');
            }
        }
    };
}
function FNSentenceList(lexunit, sentences, id) {
    var $ = jQuery;
    var lu = lexunit;
    var slDiv = document.createElement("div");
    var sents = sentences;
    var sentsHash = new Object();
    var addDiv;
    $(slDiv).attr("id", id);
    $(slDiv).addClass("SentenceList");
    var table = $('<table></table>');
    for (var i = 0; i < sents.length; i++) {
        var sid = sents[i].getId();
        var row = $('<tr></tr>');
        row.append($('<td></td>').addClass('sentlist_pre_' + sid));
        col = $('<td></td>');
        var text = sents[i].renderSentence(['Target', 'FE']);
        var sentDiv = document.createElement("div");
        $(sentDiv).addClass("sentlist_" + sid);
        $(sentDiv).addClass("Sentence");
        $(sentDiv).html(text);
        $(sentDiv).appendTo(col);
        col.appendTo(row);
        row.appendTo(table);
        sentsHash[sid] = i;
    }
    $(slDiv).append(table);
    var self = this;
    this.addSentenceClick = function addSentenceClick(clickcb) {
        $(slDiv).find("div.Sentence").click(function() {
            var sid = self.extractSentId($(this).attr("class"));
            clickcb(sid);
        });
    };
    this.addClickToAnnotate = function addClickToAnnotate(aDiv) {
        annDiv = aDiv;
        $(slDiv).find("div.Sentence").click(function() {
            $(annDiv).empty();
            var sid = self.extractSentId($(this).attr("class"));
            var anno = new FNSentenceAnnotator(lu, self, sid, $(annDiv));
        });
    };
    this.extractSentId = function extractSentId(idString) {
        var classes = idString.split(" ");
        for (var i = 0; i < classes.length; i++) {
            if (classes[i].match(/^sentlist_/)) {
                return parseInt(classes[i].split("_")[1]);
            }
        }
        return -1;
    };
    this.render = function render(container) {
        $(slDiv).appendTo(container);
    };
    this.refreshSentence = function refreshSentence(sid) {
        var sentDiv = $(slDiv).find('.sentlist_' + sid), oldhtml, newhtml, i;
        if (sentDiv.length) {
            oldhtml = sentDiv.html();
            i = sentsHash[sid];
            newhtml = sents[i].renderSentence(['Target', 'FE']);
            sentDiv.html(sents[i].renderSentence(['Target', 'FE']));
        }
    };
    this.addCheckboxes = function addCheckboxes(setname) {
        for (var i = 0; i < sents.length; i++) {
            var id = sents[i].getId();
            var checkbox = $("<input type='checkbox' name='" + setname + "' value='" + id + "'>");
            $(slDiv).find('.sentlist_pre_' + id).append(checkbox);
        }
    };
    this.checkSentence = function checkSentence(i) {
        var id = sents[i].getId();
        $(slDiv).find('.sentlist_pre_' + id + ' input:checkbox').attr("checked", true).change();
    };
    this.addNumbers = function addNumbers() {
        for (var i = 0; i < sents.length; i++) {
            var id = sents[i].getId();
            var num = i + 1;
            $(slDiv).find('.sentlist_pre_' + id).append("" + num + ".");
        }
    };
}
function FNSCBrowser(lexunit, div) {
    var $ = jQuery, lu = lexunit, browserDiv = div, tabs = document.createElement('ul'), tabContainer = document.createElement('div'), scnames = lu.getSubCorpusNames(), scSentenceLists = [], i, header = document.createElement('div'), scbody = document.createElement('div'), toggleDiv = document.createElement('div'), hidemsg = "hide", showmsg = "show", that = this;
    $(toggleDiv).attr("title", "Toggle display of subcorpora.").addClass("scbtoggle").addClass("ui-corner-top").html(hidemsg);
    $(header).addClass("scbheader").append($(toggleDiv));
    $(browserDiv).addClass("SCBrowser").append($(header));
    $(scbody).addClass('scbbody');
    for (i = 0; i < scnames.length; i += 1) {
        var tab = document.createElement('li');
        var a = document.createElement('a');
        $(a).attr('href', '#scbtab-' + i);
        $(a).html(scnames[i]);
        $(tab).append($(a));
        $(tabs).append($(tab));
    }
    $(scbody).append($(tabs));
    $(tabContainer).addClass('scbtabcontainer');
    for (i = 0; i < scnames.length; i += 1) {
        var sents = lu.getSentencesBySubCorpus(scnames[i]);
        var sentList = new FNSentenceList(lu, sents, "scbtab-" + i);
        sentList.render($(tabContainer));
        scSentenceLists[scnames[i]] = sentList;
    }
    $(scbody).append($(tabContainer));
    $(scbody).tabs();
    $(browserDiv).append($(scbody));
    $(toggleDiv).click(function(e) {
        var state = $(this).html();
        e.preventDefault();
        if (state == hidemsg) {
            that.hide();
        }
        if (state == showmsg) {
            that.show();
        }
        return false;
    });
    this.addSentenceClick = function addSentenceClick(clickcb) {
        var i;
        for (i = 0; i < scnames.length; i += 1) {
            scSentenceLists[scnames[i]].addSentenceClick(clickcb);
        }
    };
    this.getSentenceList = function getSentenceList(scname) {
        if (scname in scSentenceLists) {
            return scSentenceLists[scname];
        } else {
            return null;
        }
    }
    this.hide = function hide() {
        $(tabContainer).hide();
        $(toggleDiv).html(showmsg);
    };
    this.show = function show() {
        $(tabContainer).show();
        $(toggleDiv).html(hidemsg);
    };
    this.refreshSentence = function refreshSentence(sid) {
        var i;
        for (i = 0; i < scnames.length; i += 1) {
            scSentenceLists[scnames[i]].refreshSentence(sid);
        }
    };
}
function FNSentenceAnnotator(luxml, sid, contDiv, options) {
    var $ = jQuery;
    var lu = luxml;
    var lemma = lu.attr("name").replace(/\.[a-z]+$/, "");
    var id = sid;
    var $contDiv = $(contDiv);
    var sent = new FNSentence(lu.getSentence(id));
    var cspans = new Array();
    var baseTextSpan = null;
    var sel;
    var editorDiv = null;
    var layerPanel = null;
    var fePanel = null;
    var statusBar = null;
    var deleteButton = null;
    var simplePanel = null;
    var doc_onselectstart_save;
    var sentObj = null;
    var self = this;
    if (typeof options == 'undefined') {
        options = {'ui': 'default'};
    }
    if ($.browser.msie && parseInt($.browser.version) < 9) {
        doc_onselectstart_save = document.onselectstart;
    }
    function ie_disable_select() {
        if ($.browser.msie && parseInt($.browser.version) < 9) {
            document.onselectstart = function() {
                return false;
            };
        }
    }
    function ie_enable_select() {
        document.onselectstart = doc_onselectstart_save;
    }
    this.setRefreshObject = function setRefreshObject(sl) {
        sentObj = sl;
    };
    this.spanifyText = function spanifyText() {
        var chars = sent.getText().split(""), sentSpan = document.createElement("span"), idPref = "annoc:" + id + ":", i;
        $(sentSpan).attr("id", "annosent:" + id).addClass("sentspan");
        for (i = 0; i < chars.length; i += 1) {
            cspans[i] = document.createElement("span");
            $(cspans[i]).attr("id", idPref + i).addClass("cspan").html(chars[i]);
            sentSpan.appendChild(cspans[i]);
        }
        return sentSpan;
    }
    this.getSelection = function getSelection() {
        return sel;
    };
    this.getSentence = function getSentence() {
        return sent;
    };
    this.getLU = function getLU() {
        return lu;
    };
    this.reDraw = function reDraw() {
        this.removeLabels();
        this.addLabels("Target");
        this.addLabels("FE");
        sel.postStatus();
        if (fePanel) {
            fePanel.updateButtonStatus();
        }
        if (simplePanel) {
            simplePanel.updateResponseForm();
        }
        if (sentObj) {
            sentObj.refreshSentence(id);
        }
    };
    this.startSelection = function startSelection(event) {
        event.preventDefault();
        if (sel.inProgress) {
            $(this).mouseenter();
        } else {
            sel.setStart($(this).attr('id'));
        }
        return false;
    };
    this.endSelection = function endSelection(event) {
        event.preventDefault();
        sel.setEnd($(this).attr('id'));
        return false;
    };
    this.extendSelection = function extendSelection(event) {
        event.preventDefault();
        sel.extendTo($(this).attr('id'));
        return false;
    };
    this.clearSelection = function clearSelection(event) {
        event.preventDefault();
        sel.clear();
        return false;
    };
    this.closeSelection = function closeSelection(event) {
        event.preventDefault();
        sel.sealSelection();
        return false;
    }
    this.focusAnnotator = function focusAnnotator(event) {
        event.preventDefault();
        ie_disable_select();
        $(this).addClass('focused');
        $(document).keydown(function(e) {
            if (e.which == 37 && e.shiftKey) {
                sel.growLeft();
                return false;
            }
            if (e.which == 39 && e.shiftKey) {
                sel.growRight();
                return false;
            }
            if (e.which == 37) {
                sel.moveLeft();
                return false;
            }
            if (e.which == 39) {
                sel.moveRight();
                return false;
            }
        });
        return false;
    }
    this.unfocusAnnotator = function unfocusAnnotator(event) {
        event.preventDefault();
        $(this).removeClass('focused');
        $(document).unbind('keydown');
        ie_enable_select();
        return false;
    }
    this.addLabels = function addLabels(layer) {
        var labels = sent.getLabels(layer);
        for (index in labels) {
            var label = labels[index];
            if (!('itype' in label)) {
                for (var i = label.start; i <= label.end; i++) {
                    $(cspans[i]).addClass(sel.genLabelClass(label.layer, label.name));
                }
            }
        }
    };
    this.removeLabels = function removeLabels() {
        var labelRE = sel.allLabelRE;
        for (var i = 0; i < cspans.length; i++) {
            var classes = $(cspans[i]).attr('class').split(/\s+/);
            for (var j = 0; j < classes.length; j++) {
                var className = classes[j];
                if (className.match(labelRE)) {
                    $(cspans[i]).removeClass(className);
                }
            }
        }
    };
    this.printFELabel = function printFELabel(label) {
        return '<span class="' + sel.genLabelClass("FE", label) + '">' + label + '</span>';
    };
    this.init = function init() {
        baseTextSpan = this.spanifyText();
        sel = new FNSelectionManager(cspans, baseTextSpan);
        header = document.createElement('div');
        $(header).addClass('Header');
        $contDiv.append($(header));
        editorPanel = document.createElement('div');
        $(editorPanel).addClass('EditorPanel');
        editorDiv = document.createElement('div');
        $(editorDiv).addClass('Editor');
        $(editorDiv).append($(baseTextSpan));
        $(editorPanel).append($(editorDiv));
        statusBar = document.createElement('div');
        $(statusBar).addClass('StatusBar');
        var coordSpan = document.createElement('span');
        $(coordSpan).attr('id', 'StatusBar_CoordSpan');
        $(coordSpan).html('[,] ');
        $(statusBar).append($(coordSpan));
        $(statusBar).attr('id', 'StatusBar');
        deleteButton = document.createElement('a');
        $(deleteButton).attr('id', 'deleteLabelButton');
        $(deleteButton).addClass('ButtonLink')
        $(deleteButton).attr('href', 'http://');
        $(deleteButton).html('delete label');
        $(deleteButton).css('display', 'hide');
        $(statusBar).append($(deleteButton));
        $(editorPanel).append($(statusBar));
        $(deleteButton).click(function(e) {
            e.preventDefault();
            var start = sel.getStart();
            var end = sel.getEnd();
            if (end < start) {
                start = sel.getEnd();
                end = sel.getStart();
            }
            if (sel.hasLabel(start) && sel.hasLabel(end)) {
                var startLabel = sel.getLayerLabel(start);
                var endLabel = sel.getLayerLabel(end);
                if (startLabel != null && endLabel != null && startLabel[0] == endLabel[0] && startLabel[1] == endLabel[1]) {
                    sent.deleteLabel(startLabel[0], start, end, startLabel[1]);
                    if (simplePanel) {
                        simplePanel.postDelete(startLabel[1]);
                    }
                }
                self.reDraw();
            }
            return false;
        });
        $contDiv.append($(editorPanel));
        if (options.ui == "default") {
            layerPanel = new LayerPanel();
            fePanel = new FELabelPanel(this);
            layerPanel.addPanel("FE", fePanel.getDiv());
            $contDiv.append($(layerPanel.getDiv()));
        }
        if (options.ui == "simple") {
            simplePanel = new FESimplePanel(this, options.fes);
            $contDiv.append($(simplePanel.getDiv()));
        }
        sel.setLayer("FE");
        footer = document.createElement('div');
        $(footer).addClass('Footer');
        $contDiv.append($(footer));
        $contDiv.addClass('SentenceAnnotator');
        $('span.cspan').mousedown(this.startSelection);
        $('span.cspan').mouseup(this.endSelection);
        $('span.cspan').mouseenter(this.extendSelection);
        $(editorDiv).mouseup(this.closeSelection);
        $(editorDiv).mousedown(this.clearSelection);
        $(editorDiv).mouseleave(this.closeSelection);
        $contDiv.mouseleave(this.unfocusAnnotator);
        $contDiv.mouseenter(this.focusAnnotator);
        $contDiv.find('div').addClass('ui-corner-all');
        $contDiv.addClass('ui-corner-all');
        this.reDraw();
    };
    this.init();
    function LayerPanel() {
        var layerPanel = document.createElement("div");
        var tabs = document.createElement("ul");
        $(layerPanel).append($(tabs));
        $(layerPanel).addClass("LayerPanel");
        this.addPanel = function addPanel(layername, panelDiv) {
            var pid = $(panelDiv).attr('id');
            this.createTab(layername, pid);
            $(layerPanel).append($(panelDiv));
        }
        this.createTab = function createTab(tabname, tabid) {
            var tab = document.createElement("li");
            var link = document.createElement("a");
            $(link).attr("href", "#" + tabid);
            $(link).html(tabname);
            $(tab).append($(link));
            $(tabs).append($(tab));
        }
        this.getDiv = function getDiv() {
            $(layerPanel).tabs();
            return layerPanel;
        }
    }
    function FELabelPanel(sentanno) {
        var sel = sentanno.getSelection();
        var annotator = sentanno;
        var layer = "FE";
        var layerDiv = document.createElement('div');
        $(layerDiv).addClass('labelPanel');
        this.createLabelButton = function createLabelButton(layername, labelname) {
            var label = document.createElement('div');
            $(label).html(labelname).data('labelname', labelname).addClass(sel.genLabelClass(layername, labelname)).addClass("labelButton").click(function() {
                var start = sel.getStart(), end = sel.getEnd();
                $(this).fadeTo(50, .4);
                if (start <= end) {
                    annotator.getSentence().createLabel(layer, start, end, $(this).data('labelname'));
                } else {
                    annotator.getSentence().createLabel(layer, end, start, $(this).data('labelname'));
                }
                annotator.reDraw();
                $(this).fadeTo(150, 1);
            }).mouseenter(function(e) {
                    $(this).addClass('hover');
                }).mouseleave(function(e) {
                    $(this).removeClass('hover');
                });
            return label;
        }
        this.createCoreLabelButton = function createCoreLabelButton(layername, labelname) {
            var container = document.createElement('table'), label = document.createElement('div'), nidropdown = document.createElement("select");
            $(container).attr("id", "coreButtonSet-" + labelname).addClass("coreButtonSet");
            $(label).html(labelname).data('labelname', labelname).addClass(sel.genLabelClass(layername, labelname)).addClass("labelButton").click(function() {
                if ($(this).hasClass('disabled')) {
                    return false;
                }
                $(this).fadeTo(50, .4);
                var start = sel.getStart();
                var end = sel.getEnd();
                if (start <= end) {
                    annotator.getSentence().createLabel(layer, start, end, $(this).data('labelname'));
                } else {
                    annotator.getSentence().createLabel(layer, end, start, $(this).data('labelname'));
                }
                annotator.reDraw();
                $(this).fadeTo(150, 1);
            }).mouseenter(function(e) {
                    if (!$(this).hasClass('disabled')) {
                        $(this).addClass('hover');
                    }
                }).mouseleave(function(e) {
                    $(this).removeClass('hover');
                });
            $(nidropdown).append("<option value='none'></option>" + "<option value='CNI'>CNI</option>" + "<option value='DNI'>DNI</option>" + "<option value='INI'>INI</option>").change(function() {
                var selection = $(this).val();
                if (selection == 'none') {
                    annotator.getSentence().deleteNILabel(layername, labelname);
                    annotator.reDraw();
                } else {
                    annotator.getSentence().createNILabel(layername, selection, labelname);
                    annotator.reDraw();
                }
            });
            $(container).append("<tr><td class='left'></td><td class='center'></td><td class='right'></td></tr>");
            $(container).find('td.left').append($(label));
            $(container).find('td.right').append($(nidropdown));
            return container;
        }
        this.updateButtonStatus = function updateButtonStatus() {
            var labels = annotator.getSentence().getLabels(layer);
            $(layerDiv).find('select:disabled').removeAttr('disabled');
            $(layerDiv).find('div.disabled').fadeTo(1, 1).removeClass('disabled');
            for (var i in labels) {
                var label = labels[i];
                $("#coreButtonSet-" + label.name).each(function() {
                    if ('itype' in label) {
                        $(this).find('div.labelButton').addClass('disabled').fadeTo(50, .4);
                        $(this).find('select').val(label.itype);
                    } else {
                        $(this).find('select').attr('disabled', 'disabled');
                    }
                });
            }
        };
        this.init = function init() {
            $(layerDiv).attr("id", "Layer_" + layer);
            var coreLabels = document.createElement('fieldset');
            $(coreLabels).addClass('labelGroup');
            $(coreLabels).append($("<legend>Core:</legend>"));
            var feNames = annotator.getLU().getCoreFELabelNames();
            for (var i = 0; i < feNames.length; i++) {
                var labelname = feNames[i];
                var label = this.createCoreLabelButton(layer, labelname);
                $(coreLabels).append($(label));
            }
            $(layerDiv).append($(coreLabels));
            var ncoreLabels = document.createElement('fieldset');
            $(ncoreLabels).append($("<legend>Non-core:</legend>"));
            feNames = annotator.getLU().getNonCoreFELabelNames();
            for (var i = 0; i < feNames.length; i++) {
                var labelname = feNames[i];
                var label = this.createLabelButton(layer, labelname);
                $(ncoreLabels).append($(label));
            }
            $(layerDiv).append($(ncoreLabels));
        }
        this.getDiv = function getDiv() {
            return layerDiv;
        }
        this.init();
    }
    function FESimplePanel(sentanno, fes) {
        var layer = "FE";
        var annotator = sentanno;
        var simplePanel = document.createElement('div');
        var buttonPanel = document.createElement('div');
        var otherPanel = document.createElement('div');
        var i;
        var febutton;
        var oofcheckbox = document.createElement('input');
        var oofchecktext = document.createElement('span');
        $(buttonPanel).append($("<span>Click to apply a label:</span>"));
        for (i = 0; i < fes.length; i += 1) {
            febutton = createLabelButton("FE", fes[i]);
            $(buttonPanel).append($(febutton));
        }
        ;
        $(otherPanel).attr("id", "otherOptions");
        $(oofcheckbox).attr("type", "checkbox").attr("name", "oof").click(function() {
            if ($(this).is(":checked")) {
                $(simplePanel).find("button.labelButton").addClass("disabled").fadeTo(50, .4).attr("disabled", "disabled");
                $(otherPanel).find("input.missingfe").attr("disabled", "disabled");
                $(otherPanel).find("span.missingfetext").fadeTo(50, .4);
            } else {
                $(otherPanel).find("input.missingfe").removeAttr("disabled");
                $(otherPanel).find("span.missingfetext").fadeTo(1, 1);
            }
        });
        $(oofchecktext).html('Not the same sense of <span class="target">' + lemma + '</span> as the <span class="wordexample"></span> above.<br/>');
        $(otherPanel).append($("<span>Other possible answers:</span><br/>"), $(oofcheckbox), $(oofchecktext));
        for (i = 0; i < fes.length; i += 1) {
            $(otherPanel).append($('<input type="checkbox" class="missingfe" name="missing-' + fes[i] + '"></input>'), $('<span class="missingfetext ' + fes[i] + '"></span>').html('Same sense of <span class="target">' + lemma + '</span>, but the words that ' + self.printFELabel(fes[i]) + ' belongs on are missing from this sentence.<br/>'));
        }
        $(otherPanel).find('input[type="checkbox"]').change(function() {
            annotator.reDraw();
        });
        $(simplePanel).append($(buttonPanel), $(otherPanel));
        function createLabelButton(layername, labelname) {
            var label = document.createElement('button');
            $(label).html(labelname);
            $(label).data('labelname', labelname);
            $(label).addClass(sel.genLabelClass(layername, labelname));
            $(label).addClass("labelButton ui-corner-all");
            $(label).click(function() {
                $(this).fadeTo(50, .4);
                var start = sel.getStart();
                var end = sel.getEnd();
                if (start <= end) {
                    annotator.getSentence().createLabel(layer, start, end, $(this).data('labelname'));
                } else {
                    annotator.getSentence().createLabel(layer, end, start, $(this).data('labelname'));
                }
                annotator.reDraw();
                $(this).fadeTo(150, 1);
            });
            $(label).mouseenter(function(e) {
                $(this).addClass('hover');
            });
            $(label).mouseleave(function(e) {
                $(this).removeClass('hover');
            });
            return label;
        }
        this.getDiv = function getDiv() {
            return simplePanel;
        };
        this.updateResponseForm = function updateResponseForm() {
            var sent = annotator.getSentence(), sid = sent.getId(), labels = sent.getLabels(layer), $otherOp = $(otherPanel), i, label, labelLookup = {}, $form, $sInput, sentAns, $checkedMissing, oof = 0, allfesthere;
            $form = $('#submissionform');
            $sInput = $form.find('input[name="sentdata-' + sid + '"]');
            if ($sInput.length != 1) {
                $sInput = $('<input type="hidden"></input>').attr("name", "sentdata-" + sid).addClass("sentdata");
                $form.append($sInput);
            }
            sentAns = {"oof": 0,labels: []};
            $(simplePanel).find("button.labelButton").fadeTo(1, 1).removeClass("disabled").removeAttr("disabled");
            if (labels.length == 0) {
                if ($(oofcheckbox).is(":checked")) {
                    sentAns.oof = 1;
                    $(simplePanel).find("button.labelButton").fadeTo(50, .4).addClass("disabled").attr("disabled", "disabled");
                }
            }
            $checkedMissing = $otherOp.find('input.missingfe:checked');
            if (labels.length > 0 || $checkedMissing.length > 0) {
                $(oofcheckbox).attr("disabled", "disabled");
                $(oofchecktext).fadeTo(50, .4);
            }
            if (labels.length == 0 && $checkedMissing.length == 0) {
                $(oofcheckbox).removeAttr("disabled");
                $(oofchecktext).fadeTo(1, 1);
            }
            for (i = 0; i < labels.length; i += 1) {
                label = labels[i];
                $otherOp.find('input[name="missing-' + label.name + '"]').attr("disabled", "disabled");
                $otherOp.find('span.missingfetext.' + label.name).fadeTo(50, .4);
                labelLookup[label.name] = 1;
                sentAns.labels[sentAns.labels.length] = {"n": label.name,"m": 0,"s": label.start,"e": label.end};
            }
            $checkedMissing.each(function() {
                var extractedLabel = $(this).attr("name").replace(/^missing-/, "");
                $(simplePanel).find('button.labelButton:contains("' + extractedLabel + '")').addClass("disabled").fadeTo(50, .4).attr("disabled", "disabled");
                sentAns.labels[sentAns.labels.length] = {"n": extractedLabel,"m": 1};
            });
            $sInput.attr("value", JSON.stringify(sentAns));
            allfesthere = true;
            for (i = 0; i < fes.length; i += 1) {
                if (!(labelLookup[fes[i]] || $otherOp.find('input[name="missing-' + fes[i] + '"]:checked').length > 0)) {
                    allfesthere = false;
                }
            }
            if (sentAns.oof || allfesthere) {
                $('button#submit').trigger("enable");
            } else {
                $('button#submit').trigger("disable");
            }
        };
        this.postDelete = function(label) {
            var sent = annotator.getSentence(), sid = sent.getId(), labels = sent.getLabels(layer), $otherOp = $(otherPanel);
            if (labels.length == 0) {
                $(oofcheckbox).removeAttr("disabled");
                $(oofchecktext).fadeTo(1, 1);
            }
            $otherOp.find('input[name="missing-' + label + '"]').removeAttr("disabled");
            $otherOp.find('span.missingfetext.' + label).fadeTo(1, 1);
        };
    }
}
