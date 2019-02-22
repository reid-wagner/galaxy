define("mvc/toolshed/repository-view",["exports","mvc/toolshed/toolshed-model","libs/jquery/jstree","utils/utils","mvc/ui/ui-modal","mvc/form/form-view","mvc/toolshed/util"],function(e,t,o,i,n,s,l){"use strict";function a(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(e,"__esModule",{value:!0});var d=a(t),r=(a(o),a(i)),c=a(n),p=a(s),h=a(l),u=Backbone.View.extend({el:"#center",initialize:function(e){this.options=_.defaults(this.options||{},this.defaults),this.model=new d.default.RepositoryCollection,this.listenTo(this.model,"sync",this.render);var t=e.tool_shed.replace(/\//g,"%2f");this.model.url+="?tool_shed_url="+t+"&repository_id="+e.repository_id,this.model.tool_shed_url=e.tool_shed.replace(/%2f/g,"/"),this.model.tool_shed=t,this.model.category=e.repository_id,this.model.fetch()},render:function(e){var t=this.templateRepoDetails,o=this.model.models[0];this.options={repository:o.get("repository"),tool_shed:this.model.tool_shed,queue:h.default.queueLength()};var i=Object.keys(this.options.repository.metadata).sort(function(e,t){return parseInt(e.split(":")[0]-t.split(":")[0])}),n={},s=this.options.repository.metadata;i.forEach(function(e){n[e]=s[e]}),this.options.repository.metadata=n,this.options.current_changeset=this.options.current_changeset||i[i.length-1],this.options.current_metadata=this.options.repository.metadata[this.options.current_changeset],this.options.current_metadata.tool_shed_url=this.model.tool_shed_url,this.options.tools=this.options.current_metadata.tools,this.options.repository_dependencies_template=this.templateRepoDependencies,this.options.repository_dependency_template=this.templateRepoDependency,this.options.tps_template_global_select=this.templateGlobalSectionSelect,this.options.tps_template_tool_select=this.templateToolSectionSelect,this.options.tps_select_options=this.templatePanelSelectOptions,this.options.tool_dependencies=o.get("tool_dependencies"),this.options.shed_tool_conf=this.templateShedToolConf({shed_tool_confs:o.get("shed_conf")}),this.options.panel_section_dict=o.get("panel_section_dict"),this.options.api_url=Galaxy.root+"api/tool_shed_repositories/install?async=True",this.options=_.extend(this.options,e),this.$el.html(t(this.options)),this.checkInstalled(this.options.current_metadata),this.bindEvents(),$("#center").css("overflow","auto")},bindEvents:function(){var e=this;$("#changeset").on("change",function(){e.options.current_changeset=$("#changeset").find("option:selected").text(),e.options.current_metadata=e.options.repository.metadata[e.options.current_changeset],e.checkInstalled(e.options.current_metadata),e.reDraw(e.options)}),$("#tool_panel_section_select").on("change",function(){e.tpsSelection()}),$("#install_repository").on("click",function(t){$("#repository_installation");t.preventDefault();var o={};o.repositories=JSON.stringify([[$("#install_repository").attr("data-tsrid"),$("#changeset").find("option:selected").val()]]),o.tool_shed_repository_ids=JSON.stringify([$("#install_repository").attr("data-tsrid")]),o.tool_shed_url=e.model.tool_shed_url,o.install_tool_dependencies=$("#install_tool_dependencies").val(),o.install_repository_dependencies=$("#install_repository_dependencies").val(),o.install_resolver_dependencies=$("#install_resolver_dependencies").val();e.panelSelect(o);o.tool_panel_section=JSON.stringify(e.panelSelect(o)),o.shed_tool_conf=$("select[name='shed_tool_conf']").find("option:selected").val(),o.changeset=$("#changeset").find("option:selected").val();var i=$("#repository_installation").attr("action");e.prepareInstall(o,i)}),$("#queue_install").on("click",function(t){e.options.current_changeset=$("#changeset").find("option:selected").text(),e.options.current_metadata=e.options.repository.metadata[e.options.current_changeset];e.options.current_changeset;var o={};_.each(Object.keys(e.options.current_metadata),function(t){o[t]||(o[t]=e.options.current_metadata[t])}),o.install_tool_dependencies=$("#install_tool_dependencies").val(),o.install_repository_dependencies=$("#install_repository_dependencies").val(),o.install_resolver_dependencies=$("#install_resolver_dependencies").val(),o.tool_panel_section=JSON.stringify(e.panelSelect({})),o.shed_tool_conf=$("select[name='shed_tool_conf']").find("option:selected").val(),o.tool_shed_url=e.model.tool_shed_url,"/"==o.tool_shed_url.substr(-1)&&(o.tool_shed_url=o.tool_shed_url.substr(0,o.tool_shed_url.length-1)),h.default.addToQueue(o),e.checkInstalled(o)}),$(".tool_panel_section_picker").on("change",function(){$(this).find("option:selected").val()==$("#tool_panel_section_select").find("option:selected").val()?$(this).attr("default","active"):$(this).removeAttr("default")}),$(function(){$("#repository_dependencies").jstree()}),$(".tool_form").on("click",function(){var t=$(this).attr("data-guid"),o=($(this).attr("data-clean"),$(this).attr("data-name")),i=$(this).attr("data-desc"),n=e.model.tool_shed_url,s=$("#repository_details").attr("data-tsrid"),l=$("#changeset").find("option:selected").val(),a=Galaxy.root+"api/tool_shed/tool_json",d={guid:t,tool_shed_url:n,tsr_id:s,changeset:l};$.get(a,d,function(e){e.cls="ui-portlet-plain";var t=new p.default(e);r.default.deepeach(e.inputs,function(e){e.type&&-1!=["data","data_collection"].indexOf(e.type)&&(e.type="hidden",e.info="Data input '"+e.name+"' ("+r.default.textify(e.extensions)+")")});var n=new c.default.View,s="<u>"+o+"</u> "+i;n.show({closing_events:!0,title:s,body:t.$el,buttons:{Close:function(){n.hide()}}})})})},checkInstalled:function(e){var t=this,o={name:e.name,owner:e.owner},i=!1;t.repoQueued(e);$.get(Galaxy.root+"api/tool_shed_repositories",o,function(o){for(var n=0;n<o.length;n++){var s=o[n],l=!s.deleted&&!s.uninstalled,a=s.changeset_revision==e.changeset_revision||s.installed_changeset_revision==e.changeset_revision;s.name==e.repository.name&&s.owner==e.repository.owner&&l&&a&&(i=!0),i?($("#install_repository").prop("disabled",!0),$("#install_repository").val("This revision is already installed")):($("#install_repository").prop("disabled",!1),$("#install_repository").val("Install this revision"))}t.repoQueued(e)||i?($("#queue_install").hide(),$("#queue_install").val("This revision is already in the queue")):($("#queue_install").show(),$("#queue_install").val("Install this revision later"))})},panelSelect:function(e){var t={};return $("#tool_panel_section_select").length?e.tool_panel_section_id=$("#tool_panel_section_select").find("option:selected").val():e.new_tool_panel_section=$("#new_tool_panel_section").val(),$(".tool_panel_section_picker").each(function(){var e=$(this).attr("name"),o=$(this).attr("data-toolguid");t[o]="tool_panel_section_id"===e?{tool_panel_section:$(this).find("option:selected").val(),action:"append"}:{tool_panel_section:$(this).val(),action:"create"}}),t},reDraw:function(e){this.$el.empty(),this.render(e)},repoQueued:function(e){var t=this;if(localStorage.repositories){var o,i=t.queueKey(e);return localStorage.repositories&&(o=JSON.parse(localStorage.repositories)),!(!o||!o.hasOwnProperty(i))}},queueKey:function(e){var t=this.model.tool_shed_url;return"/"==t.substr(-1)&&(t=t.substr(0,t.length-1)),t+"|"+e.repository_id+"|"+e.changeset_revision},tpsSelection:function(){new_tps=$("#tool_panel_section_select").find("option:selected").val(),$('.tool_panel_section_picker[default="active"]').each(function(){$(this).val(new_tps)})},prepareInstall:function(e,t){var o=this;$.post(t,e,function(e){var t=JSON.parse(e);o.doInstall(t)})},doInstall:function(e){var t=Galaxy.root+"admin_toolshed/install_repositories",o="status/r/"+e.repositories.join("|");$.post(t,e,function(e){console.log("Initializing repository installation succeeded")}),Backbone.history.navigate(o,{trigger:!0,replace:!0})},templateRepoDetails:_.template(['<div class="unified-panel-header" id="panel_header" unselectable="on">','<div class="unified-panel-header-inner">Repository information for <strong><%= repository.name %></strong> from <strong><%= repository.owner %></strong></div>','<div class="unified-panel-header-inner" style="position: absolute; right: 5px; top: 0px;"><a href="#/queue">Repository Queue (<%= queue %>)</a></div>',"</div>",'<div class="unified-panel-body" id="repository_details" data-tsrid="<%= repository.id %>">','<form id="repository_installation" name="install_repository" method="post" action="<%= api_url %>">','<input type="hidden" id="repositories" name="<%= repository.id %>" value="ID" />','<input type="hidden" id="tool_shed_url" name="tool_shed_url" value="<%= tool_shed %>" />','<div class="toolForm">','<div class="toolFormTitle">Changeset</div>','<div class="toolFormBody changeset">','<select id="changeset" name="changeset" style="margin: 5px;">',"<% _.each(Object.keys(repository.metadata), function(changeset) { %>",'<% if (changeset == current_changeset) { var selected = "selected "; } else { var selected = ""; } %>','<option <%= selected %>value="<%= changeset.split(":")[1] %>"><%= changeset %></option>',"<% }); %>","</select>",'<input class="btn btn-primary preview-button" data-tsrid="<%= current_metadata.repository.id %>" type="submit" id="install_repository" name="install_repository" value="Install this revision now" />','<input class="btn btn-primary preview-button" type="button" id="queue_install" name="queue_install" value="Install this revision later" />','<div class="toolParamHelp" style="clear: both;">Please select a revision and review the settings below before installing.</div>',"</div>","</div>","<%= shed_tool_conf %>","<% if (current_metadata.has_repository_dependencies) { %>",'<div class="toolFormTitle">Repository dependencies for <strong id="current_changeset"><%= current_changeset %></strong></div>','<div class="toolFormBody">','<p id="install_repository_dependencies_checkbox">','<input type="checkbox" checked id="install_repository_dependencies" />','<label for="install_repository_dependencies">Install repository dependencies</label>',"</p>","<% current_metadata.repository_dependency_template = repository_dependency_template; %>",'<div class="tables container-table" id="repository_dependencies">','<div class="expandLink">','<a class="toggle_folder" data_target="repository_dependencies_table">',"Repository dependencies &ndash; <em>installation of these additional repositories is required</em>","</a>","</div>","<%= repository_dependencies_template(current_metadata) %>","</div>","</div>","<% } %>","<% if (current_metadata.includes_tool_dependencies) { %>",'<div class="toolFormTitle">Tool dependencies</div>','<div class="toolFormBody">','<p id="install_resolver_dependencies_checkbox">','<input type="checkbox" checked id="install_resolver_dependencies" />','<label for="install_resolver_dependencies">Install resolver dependencies</label>',"</p>",'<p id="install_tool_dependencies_checkbox">','<input type="checkbox" checked id="install_tool_dependencies" />','<label for="install_tool_dependencies">Install tool dependencies</label>',"</p>",'<div class="tables container-table" id="tool_dependencies">','<div class="expandLink">','<a class="toggle_folder" data_target="tool_dependencies_table">',"Tool dependencies &ndash; <em>repository tools require handling of these dependencies</em>","</a>","</div>",'<table class="tables container-table" id="tool_dependencies_table" border="0" cellpadding="2" cellspacing="2" width="100%">',"<thead>",'<tr style="display: table-row;" class="datasetRow" parent="0" id="libraryItem-rt-f9cad7b01a472135">','<th style="padding-left: 40px;">Name</th>',"<th>Version</th>","<th>Type</th>","</tr>","</thead>",'<tbody id="tool_deps">',"<% _.each(tool_dependencies[current_changeset], function(dependency) { %>",'<tr class="datasetRow tool_dependency_row" style="display: table-row;">','<td style="padding-left: 40px;">',"<%= dependency.name %></td>","<td><%= dependency.version %></td>","<td><%= dependency.type %></td>","</tr>","<% }); %>","</tbody>","</table>","</div>","</div>","<% } %>","<% if (current_metadata.includes_tools_for_display_in_tool_panel) { %>",'<div class="toolFormTitle">Tools &ndash; <em>click the name to preview the tool and use the pop-up menu to inspect all metadata</em></div>','<div class="toolFormBody">','<div class="tables container-table" id="tools_toggle">','<table class="tables container-table" id="valid_tools" border="0" cellpadding="2" cellspacing="2" width="100%">',"<thead>",'<tr style="display: table-row;" class="datasetRow" parent="0" id="libraryItem-rt-f9cad7b01a472135">','<th style="padding-left: 40px;">Name</th>',"<th>Description</th>","<th>Version</th>","<th><%= tps_template_global_select({tps: panel_section_dict, tps_select_options: tps_select_options}) %></tr>","</thead>",'<tbody id="tools_in_repo">',"<% _.each(current_metadata.tools, function(tool) { %>",'<tr id="libraryItem-<%= tool.clean %>" class="tool_row" style="display: table-row;" style="width: 15%">','<td style="padding-left: 40px;">','<div id="tool-<%= tool.clean %>" class="menubutton split popup" style="float: left;">','<a class="tool_form view-info" data-toggle="modal" data-target="toolform_<%= tool.clean %>" data-clean="<%= tool.clean %>" data-guid="<%= tool.guid %>" data-name="<%= tool.name %>" data-desc="<%= tool.description %>"><%= tool.name %></a>',"</div>","</td>","<td><%= tool.description %></td>",'<td style="width: 15%"><%= tool.version %></td>','<td style="width: 35%" id="tool_tps_<%= tool.clean %>">',"<%= tps_template_tool_select({tool: tool, tps: panel_section_dict, tps_select_options: tps_select_options}) %>","</td>","</tr>","<% }); %>","</tbody>","</table>","</div>","</div>","<% } %>","</form>","</div>"].join("")),templateRepoDependencies:_.template(['<div class="toolFormTitle">Repository Dependencies</div>','<div class="toolFormBody tables container-table" id="repository_dependencies">',"<ul>","<li>Repository installation requires the following","<% if (has_repository_dependencies) { %>","<% _.each(repository_dependencies, function(dependency) { %>","<% dependency.repository_dependency_template = repository_dependency_template; %>","<%= repository_dependency_template(dependency) %>","<% }); %>","<% } %>","</li>","</ul>","</div>"].join("")),templateRepoDependency:_.template(['<li id="metadata_<%= id %>" class="datasetRow repository_dependency_row">',"Repository <b><%= repository.name %></b> revision <b><%= changeset_revision %></b> owned by <b><%= repository.owner %></b>","<% if (has_repository_dependencies) { %>",'<ul class="child_dependencies">',"<% _.each(repository_dependencies, function(dependency) { %>","<% dependency.repository_dependency_template = repository_dependency_template; %>","<%= repository_dependency_template(dependency) %>","<% }); %>","</ul>","<% } %>","</li>"].join("")),templateShedToolConf:_.template(['<div class="toolFormTitle">Shed tool configuration file:</div>','<div class="toolFormBody">','<div class="form-row">','<select name="shed_tool_conf">',"<% _.each(shed_tool_confs.options, function(conf) { %>",'<option value="<%= conf.value %>"><%= conf.label %></option>',"<% }); %>","</select>",'<div class="toolParamHelp" style="clear: both;">Select the file whose <b>tool_path</b> setting you want used for installing repositories.</div>',"</div>","</div>"].join("")),templateToolDependency:_.template(["<% if (has_repository_dependencies) { %>","<% _.each(repository_dependencies, function(dependency) { %>","<% if (dependency.includes_tool_dependencies) { %>","<% dependency.tool_dependency_template = tool_dependency_template %>","<%= tool_dependency_template(dependency) %>","<% } %>","<% }); %>","<% } %>"].join("")),templateGlobalSectionCreate:_.template(['<div id="tool_panel_section">','<div class="form-row" id="new_tps">','<input id="new_tool_panel_section" name="new_tool_panel_section" type="textfield" value="" size="40"/>','<input class="btn btn-primary" type="button" id="select_existing" value="Select existing" />','<div class="toolParamHelp" style="clear: both;">',"Add a new tool panel section to contain the installed tools (optional).","</div>","</div>","</div>"].join("")),templateGlobalSectionSelect:_.template(['<div id="tool_panel_section">','<div class="toolFormTitle">Tool Panel Section</div>','<div class="toolFormBody">','<div class="tab-pane" id="select_tps">','<select name="<%= name %>" id="<%= tps.id %>">',"<%= tps_select_options({sections: tps.sections}) %>","</select>",'<input class="btn btn-primary" type="button" id="create_new" value="Create new" />','<div class="toolParamHelp" style="clear: both;">',"Select an existing tool panel section to contain the installed tools (optional).","</div>","</div>","</div>","</div>"].join("")),templateToolSectionCreate:_.template(['<div id="new_tps_<%= tool.clean %>" data-clean="<%= tool.clean %>" class="form-row">','<input data-toolguid="<%= tool.guid %>" class="tool_panel_section_picker" size="40" name="new_tool_panel_section" id="new_tool_panel_section_<%= tool.clean %>" type="text">','<input id="per_tool_select_<%= tool.clean %>" class="btn btn-primary" data-toolguid="<%= tool.guid %>" value="Select existing" id="select_existing_<%= tool.clean %>" type="button">',"</div>"].join("")),templateToolSectionSelect:_.template(['<div id="select_tps_<%= tool.clean %>" data-clean="<%= tool.clean %>" class="tps_creator">','<select default="active" style="width: 30em;" data-toolguid="<%= tool.guid %>" class="tool_panel_section_picker" name="tool_panel_section_id" id="tool_panel_section_select_<%= tool.clean %>">',"<%= tps_select_options({sections: tps.sections}) %>","</select>",'<input id="per_tool_create_<%= tool.clean %>" data-clean="<%= tool.clean %>" class="btn btn-primary create-tps-button" data-toolguid="<%= tool.guid %>" value="Create new" id="create_new_<%= tool.clean %>" type="button">','<div style="clear: both;" class="toolParamHelp"></div>',"</div>"].join("")),templatePanelSelectOptions:_.template(["<% _.each(sections, function(section) { %>",'<option value="<%= section.id %>"><%= section.name %></option>',"<% }); %>"].join(""))});e.default={RepoDetails:u}});
//# sourceMappingURL=../../../maps/mvc/toolshed/repository-view.js.map