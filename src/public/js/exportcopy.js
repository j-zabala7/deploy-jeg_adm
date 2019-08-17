$(document).ready(function() {
    $('#list-data').DataTable( {
        dom: 'Bfrtip',
        buttons: [
            'copy', 'csv', 'excel', 'pdf', 'print'
        ]
    } );
} );

$(document).ready(function() {
    $('#list-data').DataTable({
      "language": {"url": "https://cdn.datatables.net/plug-ins/1.10.19/i18n/Spanish.json"  },
        "dom": 'Bfrtip',
        "buttons": [{
                extend: 'excelHtml5',
                title: 'PSC - '+'#{tagExport}',
                exportOptions: {
                    columns: ':visible'
                }
            },
            {
                extend: 'pdfHtml5',
                title: 'PSC - '+'#{tagExport}',
                exportOptions: {
                    columns: ':visible'
                }
            },'print','colvis'
        ]
    });
  });