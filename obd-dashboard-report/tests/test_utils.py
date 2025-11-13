# tests/test_utils.py
from obdtools.utils.names import normalize_header, safe_id
from obdtools.utils.downsample import thin_slice

def test_normalize_header_strips_unit_suffix():
    assert normalize_header("RPM [rpm]") == "RPM"
    assert normalize_header("coolant_temp") == "coolant_temp"

def test_safe_id_simple():
    # spaces -> underscore
    assert safe_id("Engine RPM") == "Engine_RPM"
    # multiple separators collapse to ONE underscore (design choice)
    assert safe_id("O2: Bank 1 / S1") == "O2_Bank_1_S1"

def test_safe_id_no_double_underscores():
    # ensure no consecutive underscores are produced
    s = safe_id("A  ::  B // C")
    assert "__" not in s

def test_thin_slice():
    assert thin_slice(100, 0) == slice(None)
    assert thin_slice(100, 200) == slice(None)
    s = thin_slice(1000, 100)
    assert isinstance(s, slice) and s.step >= 1
