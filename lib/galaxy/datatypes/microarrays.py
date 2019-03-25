import logging

from galaxy.datatypes import data
from galaxy.datatypes.binary import (  # noqa: F401
    Binary,
    Cel
)
from galaxy.datatypes.data import get_file_peek
from galaxy.datatypes.metadata import MetadataElement
from galaxy.datatypes.sniff import (
    build_sniff_from_prefix,
    get_headers
)

log = logging.getLogger(__name__)


class GenericMicroarrayFile(data.Text):
    """
    Abstract class for most of the microarray files.
    """
    MetadataElement(name="version_number", default="1.0", desc="Version number", readonly=True, visible=True,
                    optional=True, no_value="1.0")
    MetadataElement(name="file_format", default="ATF", desc="File format", readonly=True, visible=True,
                    optional=True, no_value="ATF")
    MetadataElement(name="number_of_optional_header_records", default=1, desc="Number of optional header records",
                    readonly=True, visible=True, optional=True, no_value=1)
    MetadataElement(name="number_of_data_columns", default=1, desc="Number of data columns",
                    readonly=True, visible=True,
                    optional=True, no_value=1)
    MetadataElement(name="file_type", default="GenePix", desc="File type",
                    readonly=True, visible=True,
                    optional=True, no_value="GenePix")
    MetadataElement(name="block_count", default=1, desc="Number of blocks described in the file",
                    readonly=True, visible=True,
                    optional=True, no_value=1)
    MetadataElement(name="block_type", default=0, desc="Type of block",
                    readonly=True, visible=True,
                    optional=True, no_value=0)

    def set_peek(self, dataset, is_multi_byte=False):
        if not dataset.dataset.purged:
            if dataset.metadata.block_count == 1:
                dataset.blurb = "%s %s: Format %s, 1 block, %s headers and %s columns" % (dataset.metadata.file_type, dataset.metadata.version_number, dataset.metadata.file_format, dataset.metadata.number_of_optional_header_records, dataset.metadata.number_of_data_columns)
            else:
                dataset.blurb = "%s %s: Format %s, %s blocks, %s headers and %s columns" % (dataset.metadata.file_type, dataset.metadata.version_number, dataset.metadata.file_format, dataset.metadata.block_count, dataset.metadata.number_of_optional_header_records, dataset.metadata.number_of_data_columns)
            dataset.peek = get_file_peek(dataset.file_name)
        else:
            dataset.peek = 'file does not exist'
            dataset.blurb = 'file purged from disk'

    def get_mime(self):
        return 'text/plain'


@build_sniff_from_prefix
class Gal(GenericMicroarrayFile):
    """ Gal File format described at:
            http://mdc.custhelp.com/app/answers/detail/a_id/18883/#gal
    """

    edam_format = "format_3829"
    edam_data = "data_3110"
    file_ext = "gal"

    def sniff_prefix(self, file_prefix):
        """
        Try to guess if the file is a Gal file.
        >>> from galaxy.datatypes.sniff import get_test_fname
        >>> fname = get_test_fname('test.gal')
        >>> Gal().sniff(fname)
        True
        >>> fname = get_test_fname('test.gpr')
        >>> Gal().sniff(fname)
        False
        """
        headers = get_headers(file_prefix, sep="\t", count=3)
        return "ATF" in headers[0][0] and "GenePix ArrayList" in headers[2][0]

    def set_meta(self, dataset, **kwd):
        """
        Set metadata for Gal file.
        """
        super(Gal, self).set_meta(dataset, **kwd)
        headers = get_headers(dataset.file_name, sep="\t", count=5)
        dataset.metadata.file_format = headers[0][0]
        dataset.metadata.version_number = headers[0][1]
        dataset.metadata.number_of_optional_header_records = int(headers[1][0])
        dataset.metadata.number_of_data_columns = int(headers[1][1])
        dataset.metadata.file_type = headers[2][0].strip().strip('"').split("=")[1]
        if "BlockCount" in headers[3][0]:
            dataset.metadata.block_count = int(headers[3][0].strip().strip('"').split("=")[1])
        if "BlockType" in headers[4][0]:
            dataset.metadata.block_type = int(headers[4][0].strip().strip('"').split("=")[1])


@build_sniff_from_prefix
class Gpr(GenericMicroarrayFile):
    """ Gpr File format described at:
            http://mdc.custhelp.com/app/answers/detail/a_id/18883/#gpr
    """

    edam_format = "format_3829"
    edam_data = "data_3110"
    file_ext = "gpr"

    def sniff_prefix(self, file_prefix):
        """
        Try to guess if the file is a Gpr file.
        >>> from galaxy.datatypes.sniff import get_test_fname
        >>> fname = get_test_fname('test.gpr')
        >>> Gpr().sniff(fname)
        True
        >>> fname = get_test_fname('test.gal')
        >>> Gpr().sniff(fname)
        False
        """
        headers = get_headers(file_prefix, sep="\t", count=3)
        return "ATF" in headers[0][0] and "GenePix Results" in headers[2][0]

    def set_meta(self, dataset, **kwd):
        """
        Set metadata for Gpr file.
        """
        super(Gpr, self).set_meta(dataset, **kwd)
        headers = get_headers(dataset.file_name, sep="\t", count=5)
        dataset.metadata.file_format = headers[0][0]
        dataset.metadata.version_number = headers[0][1]
        dataset.metadata.number_of_optional_header_records = int(headers[1][0])
        dataset.metadata.number_of_data_columns = int(headers[1][1])
        dataset.metadata.file_type = headers[2][0].strip().strip('"').split("=")[1]
