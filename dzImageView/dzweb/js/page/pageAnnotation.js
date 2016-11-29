function fillAnnotationTable(dzCallback) {
    const annotationTdColSpan = 6; // const

    if (!isUndefined(dzCallback))
        theSingleton.getInstance().setMainDzCallback(dzCallback);

    var isEditMode = _getById('chbEdit').checked;

    var tblAnnotation = _getById('tblAnnotation');
    while (tblAnnotation.firstChild)
        tblAnnotation.removeChild(tblAnnotation.firstChild);

    // Annotation table header
    _getById('divAnnotationTitle').textContent = TXT.AnnotationTableTitle;
	
	var layers = getLayerCollection().layers;
    if (layers.length > 0) {
        for (var i = layers.length - 1; i >= 0; i--) {
            var layer = layers[i];
            var selectedRegions = layer.selectedRegions;

            // Layer header

            tr = _create('tr');
            tr.className = 'layerTr';

            // Checkboxes collapse
            td = _create('td');
            td.className = 'layerExpandTd';
            chb = createAwesomeLayerCollapse('chbCollapse' + '_' + i.toString(), function (arg) {
                // collapse / expand layer
                var b = arg.checked;
                i = parseInt(arg.id.split('_')[1]);
                var layer = layers[i];
                for (var j = 0; j < layer.selectedRegions.length; j++) {
                    var suffixId = '_' + i.toString() + '_' + j.toString();
                    showElement(_getById('trSelectedRegion' + suffixId), !b);
                    showElement(_getById('trAnnotation' + suffixId), !b);
                }
            });
            td.appendChild(chb);           
            tr.appendChild(td);

            //
            td = _create('td');           
            tr.appendChild(td);

            // Title
            td = _create('td');
            td.innerHTML = '<i class="smallItalicInLayerTitle">' + TXT.LayerInLayerTitle + '</i>' + layer.title + TXT.DelimiterInLayerTitle + 
                           '<i class="smallItalicInLayerTitle">' + ' (' + TXT.ItemsInLayerTitle + selectedRegions.length + ')</i>';
            td.className = 'layerTd';
            tr.appendChild(td);

            // Checkboxes ShowHide
            td = _create('td');
            chb = createAwesomeLayerShow('chbShowHide' + '_' + i.toString(), function (arg) {
                // show / hide layer's selected regions
                var b = arg.checked;
                i = parseInt(arg.id.split('_')[1]);
                var layer = layers[i];
                for (var j = 0; j < layer.selectedRegions.length; j++) {
                    _getById('chbShowHide' + '_' + i.toString() + '_' + j.toString()).onclick({ shouldCheck: b, noUpdate: true });
                    layer.selectedRegions[j].isShown = !b;
                }
                theSingleton.getInstance().getMainDzCallback()({ forceRedraw: true });
            });
            td.appendChild(chb);
            tr.appendChild(td);

            // 
            td = _create('td');
            tr.appendChild(td);

            // 
            td = _create('td');
            tr.appendChild(td);

            // Buttons Edit
            td = _create('td');
            btn = createAwesomeEditLayer('btnEdit' + '_' + i.toString(), function (arg) {
                getLayerFromCtrlClick(arg).edit(theSingleton.getInstance().getMainDzCallback());
            });
            showElement(btn, isEditMode);

            td.appendChild(btn);
            tr.appendChild(td);

            // Buttons Delete
            td = _create('td');
            btn = createAwesomeDeleteLayer('btnDelete' + '_' + i.toString(), function (arg) {
                var layer = getLayerFromCtrlClick(arg);
                if (confirm(TXT.QWantDelete.replace('%s0', TXT.QLayer).replace('%s1', layer.title))) 
                    layer.delete(theSingleton.getInstance().getMainDzCallback());
            });
            showElement(btn, isEditMode);
            enableElement(btn, selectedRegions.length === 0)

            td.appendChild(btn);
            tr.appendChild(td);

            tblAnnotation.appendChild(tr);

            // Selection Regions loop
            for (var j = selectedRegions.length - 1; j >= 0; j--) {
                var suffixId = '_' + i.toString() + '_' + j.toString();

                // Insert selectedRegions header here
                tblselectedRegion = _create('table');

                tr = _create('tr');
                tr.id = 'trSelectedRegion' + suffixId;

                // Leading placeholder
                td = _create('td');
                tr.appendChild(td);

                // Checkboxes collapse
                td = _create('td');
                td.align = 'left';
                chb = createAwesomeCollapse('chbCollapse' + suffixId, function (arg) {
                    // collapse / expand
                    showElement(_getById(arg.id.replace('chbCollapse', 'tdAnnotation')), !arg.checked);
                });
                td.appendChild(chb);
                tr.appendChild(td);

                // Selected Region title
                td = _create('td');
                td.align = 'left';
                td.textContent = selectedRegions[j].title;
                td.className = 'annotationTitleTd';
                tr.appendChild(td);

                    // Checkboxes ShowHide
                    td = _create('td');
                    chb = createAwesomeShow('chbShowHide' + suffixId, function (arg) {
                        getSelectedRegionFromId(arg.id).showHide(!arg.checked);
                        theSingleton.getInstance().getMainDzCallback()({ forceRedraw: true });

                        if (isUndefined(arg.NoUpdate)) {
                            i = parseInt(arg.id.split('_')[1]);
                            var layer = layers[i];
                            var countShown = 0;
                            for (var j = 0; j < layer.selectedRegions.length; j++)
                                if (layer.selectedRegions[j].isShown)
                                    countShown++;

                            var layerToggle = _getById('chbShowHide' + '_' + i.toString());

                            if (countShown === 0)
                                layerToggle.onclick({ shouldCheck: true, noUpdate: true }); // opposite!!

                            if (countShown === layer.selectedRegions.length)
                                layerToggle.onclick({ shouldCheck: false, noUpdate: true }); // opposite!!
                        }
                    });

                    td.appendChild(chb);
                    tr.appendChild(td);

                    // Buttons Up
                    td = _create('td');
                    btn = createAwesomeUp('btnUp' + suffixId, function (arg) {
                        swapUp(this.id);
                        theSingleton.getInstance().getMainDzCallback()({ swap: true });

                        enableElement(btnUndo, true);
                        enableElement(btnSaveEdit, true);
                    });
                    showElement(btn, isEditMode);
                    enableElement(btn, j < selectedRegions.length - 1);

                    td.appendChild(btn);
                    tr.appendChild(td);

                    // Buttons Down
                    td = _create('td');
                    btn = createAwesomeDown('btnDown' + suffixId, function (arg) {
                        swapDown(this.id);
                        theSingleton.getInstance().getMainDzCallback()({ swap: true });

                        enableElement(btnUndo, true);
                        enableElement(btnSaveEdit, true);
                    });
                    showElement(btn, isEditMode);
                    enableElement(btn, j > 0);

                    td.appendChild(btn);
                    tr.appendChild(td);

                    // Buttons Edit
                    td = _create('td');
                    btn = createAwesomeEdit('btnEdit' + suffixId, function (arg) {
                        getSelectedRegionFromCtrlClick(arg).edit(theSingleton.getInstance().getMainDzCallback());
                    });
                    showElement(btn, isEditMode);

                    td.appendChild(btn);
                    tr.appendChild(td);

                    // Buttons Delete
                    td = _create('td');
                    btn = createAwesomeDelete('btnDelete' + suffixId, function (arg) {
                        var selectedRegion = getSelectedRegionFromCtrlClick(arg);
                        if (confirm(TXT.QWantDelete.replace('%s0', TXT.QRegion).replace('%s1', selectedRegion.title))) {
                            selectedRegion.delete(theSingleton.getInstance().getMainDzCallback());

                            enableElement(btnUndo, true);
                            enableElement(btnSaveEdit, true);
                        }
                    });
                    showElement(btn, isEditMode);

                    td.appendChild(btn);
                    tr.appendChild(td);

                    tblAnnotation.appendChild(tr);

                    // Annotation row
                    tr = _create('tr');
                    tr.id = 'trAnnotation' + suffixId;

                    //
                    td = _create('td');
                    tr.appendChild(td);

                    // Annotation text
                    td = _create('td');
                    tr.appendChild(td);

                    td = _create('td');
                    td.id = 'tdAnnotation' + suffixId;
                    td.textContent = selectedRegions[j].annotation;
                    td.colSpan = annotationTdColSpan;
                    td.className = 'annotationTextTd';
                    tr.appendChild(td);
                    tblAnnotation.appendChild(tr);
            }
        }
    }
}
