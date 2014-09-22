<ul>
<% for(var index in pages) { %>
<li><a href="<%= pages[index].url%>"><%= pages[index].name %></a></li>
<% } %>
</ul>