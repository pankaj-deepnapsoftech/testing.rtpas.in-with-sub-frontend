// @ts-nocheck

import { useEffect, useMemo, useState } from "react";
import {
  Cell,
  Column,
  HeaderGroup,
  TableInstance,
  usePagination,
  useSortBy,
  useTable,
} from "react-table";
import { toast } from "react-toastify";
import Loading from "../../ui/Loading";
import { FcApproval, FcDatabase } from "react-icons/fc";
import {
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { FaCaretDown, FaCaretUp, FaFilePdf } from "react-icons/fa";
import moment from "moment";
import { MdDeleteOutline, MdEdit, MdOutlineVisibility } from "react-icons/md";
import EmptyData from "../../ui/emptyData";
import { colors } from "../../theme/colors";
import { useCookies } from "react-cookie";
import BOMPDF from "../PDF/BOMPDF";
import axios from "axios";
import { SquarePen } from "lucide-react";

interface BOMTableProps {
  boms: Array<{
    _id: string;
    bom_name: string;
    parts_count: string;
    total_cost: string;
    approval_date?: string;
    createdAt: string;
    updatedAt: string;
  }>;
  isLoadingBoms: boolean;
  openUpdateBomDrawerHandler?: (id: string) => void;
  openBomDetailsDrawerHandler?: (id: string) => void;
  deleteBomHandler?: (id: string) => void;
  approveBomHandler?: (id: string) => void;
  refreshBoms?: () => void;
  bulkApproveBomsHandler?: (ids: string[]) => void;
}

const BOMTable: React.FC<BOMTableProps> = ({
  boms,
  isLoadingBoms,
  openUpdateBomDrawerHandler,
  openBomDetailsDrawerHandler,
  deleteBomHandler,
  approveBomHandler,
  refreshBoms,
  bulkApproveBomsHandler,
}) => {
  const dataBoms = Array.isArray(boms) ? boms : [];
  const memoBoms = useMemo(() => dataBoms, [boms]);
  const [showDeletePage, setshowDeletePage] = useState(false);
  const [deleteId, setdeleteId] = useState("");
  const [cookies] = useCookies();

  const [selectedBoms, setSelectedBoms] = useState([]);

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const [editingQuantity, setEditingQuantity] = useState<{
    [key: string]: number;
  }>({});
  const [updatingBomId, setUpdatingBomId] = useState<string | null>(null);
  const [scrapCatalog, setScrapCatalog] = useState<any[]>([]);

  const fetchBomForPDF = async (bomId: string) => {
    try {
      setIsGeneratingPDF(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + `bom/${bomId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data.bom;
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch BOM data");
      return null;
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const [userData, setUserData] = useState<PurchaseOrder | null>(null);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}auth/user`,
        {
          headers: { Authorization: `Bearer ${cookies?.access_token}` },
        }
      );

      if (response.data.success) {
        setUserData(response.data.user);
      } else {
        console.error("Failed to fetch user data:", response.data.message);
        toast.error("Failed to fetch user data");
      }
    } catch (error: any) {
      console.error("Error fetching user data:", error);
      toast.error(error.message || "Failed to fetch user data");
    }
  };

  const fetchScrapCatalog = async () => {
    try {
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + `scrap/get?limit=${500}&page=${1}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setScrapCatalog(data.data);
      }
    } catch (error) {
      console.error("Error fetching scrap catalog:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchScrapCatalog();
  }, []);

  const handlePDFDownload = async (bomId: string, bomName: string) => {
    const fullBomData = await fetchBomForPDF(bomId);
    if (fullBomData) {
      const { pdf } = await import("@react-pdf/renderer");
      const blob = await pdf(
        <BOMPDF bom={fullBomData} userData={userData} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `BOM_${bomName || bomId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleQuantityChange = (bomId: string, value: number) => {
    setEditingQuantity((prev) => ({ ...prev, [bomId]: value }));
  };

  const handleUpdateFinishedGoodQty = async (bomId: string) => {
    const newQuantity = editingQuantity[bomId];
    if (newQuantity === undefined || newQuantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    try {
      setUpdatingBomId(bomId);

      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + `bom/${bomId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const data = await response.json();
      if (!data.success) throw new Error(data.message);

      const bom = data.bom;
      const originalQuantity = bom.finished_good?.quantity || 1;

      // Simple ratio-based multiplier (matching UpdateBom logic)
      const multiplier = newQuantity / originalQuantity;

      const updatedRawMaterials = bom.raw_materials?.map((material: any) => {
        const newMaterialQuantity = Math.ceil(
          Number(material?.quantity || 0) * multiplier
        );
        return {
          item: material?.item?._id,
          description: material?.description,
          quantity: newMaterialQuantity,
          uom: material?.uom,
          unit_cost: material?.unit_cost,
          category: material?.category,
          assembly_phase: material?.assembly_phase,
          supplier: material?.supplier?._id,
          supporting_doc: material?.supporting_doc,
          comments: material?.comments,
          total_part_cost: Math.ceil(
            newMaterialQuantity * Number(material?.unit_cost || 0)
          ),
          _id: material?._id,
        };
      });

      const updateScrapQuantities = async (scrapMaterialsToUpdate: any[]) => {
        try {
          console.log("Scrap materials to update:", scrapMaterialsToUpdate);
          console.log("Scrap catalog:", scrapCatalog);

          const updatePromises = scrapMaterialsToUpdate.map(
            async (scrapMaterial) => {
              const scrapId = scrapMaterial.item || scrapMaterial.scrap_id;
              const quantityToAdd = Number(scrapMaterial.quantity) || 0;

              console.log(
                "Processing scrap ID:",
                scrapId,
                "Quantity to add:",
                quantityToAdd
              );

              if (!scrapId) {
                console.log("No scrap ID found, skipping");
                return;
              }

              let currentQty = 0;
              try {
                const scrapResponse = await fetch(
                  `${process.env.REACT_APP_BACKEND_URL}scrap/get/${scrapId}`,
                  {
                    method: "GET",
                    headers: {
                      Authorization: `Bearer ${cookies?.access_token}`,
                    },
                  }
                );
                const scrapData = await scrapResponse.json();
                if (scrapData?.data) {
                  currentQty = Number(scrapData?.data?.qty) || 0;
                }
                 console.log("scrapData", scrapData);
                console.log("currQty:", currentQty);
              } catch (err) {
                const currentScrap = scrapCatalog.find(
                  (s: any) => s._id === scrapId
                );
                currentQty = Number(currentScrap?.qty) || 0;
              }

              const newQty = currentQty + quantityToAdd;
              console.log("Current qty??????:", currentQty,  "New qty:", newQty);

              const response = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}scrap/update/${scrapId}`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${cookies?.access_token}`,
                  },
                  body: JSON.stringify({ qty: newQty }),
                }
              );
              const result = await response.json();
              console.log("Scrap update response:", result);
            }
          );

          await Promise.all(updatePromises);
        } catch (error) {
          console.error("Error updating scrap quantities", error);
        }
      };

      const updatedScrapMaterials = bom.scrap_materials?.map(
        (material: any) => {
          const newScrapQuantity = Math.ceil(
            Number(material.quantity || 0) * multiplier
          );
          return {
            item: material?.item?._id || material?.item,
            scrap_id: material?.scrap_id,
            scrap_name: material?.scrap_name,
            quantity: newScrapQuantity,
            unit_cost: material?.unit_cost,
            total_part_cost: Math.ceil(
              Number(material?.unit_cost || 0) * newScrapQuantity
            ),
          };
        }
      );

      if (updatedScrapMaterials?.length > 0) {
        await updateScrapQuantities(updatedScrapMaterials);
      }

      const rawMaterialsCost =
        updatedRawMaterials?.reduce(
          (acc: number, m: any) => acc + (Number(m.total_part_cost) || 0),
          0
        ) || 0;

      const otherCharges = bom.other_charges || {};
      const totalOtherCharges =
        (Number(otherCharges.labour_charges) || 0) +
        (Number(otherCharges.machinery_charges) || 0) +
        (Number(otherCharges.electricity_charges) || 0) +
        (Number(otherCharges.other_charges) || 0);

      const newTotalCost = rawMaterialsCost + totalOtherCharges;

      const updateBody = {
        _id: bomId,
        approved: false,
        raw_materials: updatedRawMaterials,
        scrap_materials: updatedScrapMaterials,
        processes: bom.processes || [],
        finished_good: {
          item: bom.finished_good?.item?._id,
          description: bom.finished_good?.description,
          quantity: newQuantity,
          uom: bom.finished_good?.item?.uom,
          category: bom.finished_good?.item?.category,
          supporting_doc: bom.finished_good?.supporting_doc,
          comments: bom.finished_good?.comments,
          cost: (bom.finished_good?.item?.price || 0) * newQuantity,
        },
        bom_name: bom.bom_name,
        parts_count: bom.parts_count,
        total_cost: newTotalCost,
        other_charges: bom.other_charges,
        remarks: bom.remarks,
        manpower: bom.manpower,
        resources: bom.resources?.map((r: any) => ({
          resource_id: r.resource_id?._id || r.resource_id,
          type: r.type,
          specification: r.specification,
          comment: r.comment || "",
          customId: r.customId,
        })),
      };

      const updateResponse = await fetch(
        process.env.REACT_APP_BACKEND_URL + `bom/${bomId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cookies?.access_token}`,
          },
          body: JSON.stringify(updateBody),
        }
      );

      const updateResult = await updateResponse.json();
      if (!updateResult.success) throw new Error(updateResult.message);

      toast.success("Finished good quantity updated successfully!");

      setEditingQuantity((prev) => {
        const newState = { ...prev };
        delete newState[bomId];
        return newState;
      });

      if (refreshBoms) refreshBoms();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update quantity");
    } finally {
      setUpdatingBomId(null);
    }
  };

  const columns = useMemo(
    () => [
      { Header: "BOM ID", accessor: "_id" },
      { Header: "BOM Name", accessor: "bom_name" },
      { Header: "Parts Count", accessor: "parts_count" },
      { Header: "Total Cost", accessor: "total_cost" },
      { Header: "Update Finished Good Qty", accessor: "sdf" },
      { Header: "Created On", accessor: "createdAt" },
      { Header: "Last Updated", accessor: "updatedAt" },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    state: { pageIndex, pageSize },
    pageCount,
    setPageSize,
  }: TableInstance<{
    _id: string;
    bom_name: string;
    parts_count: string;
    total_cost: string;
    createdAt: string;
    updatedAt: string;
  }> = useTable(
    {
      columns,
      data: memoBoms,
      initialState: { pageIndex: 0 },
    },
    useSortBy,
    usePagination
  );

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedBoms(page.map((row) => row.original._id));
    } else {
      setSelectedBoms([]);
    }
  };

  const handleSelectBom = (bomId, checked) => {
    if (checked) {
      setSelectedBoms((prev) => [...prev, bomId]);
    } else {
      setSelectedBoms((prev) => prev.filter((id) => id !== bomId));
    }
  };

  const isAllSelected = page.length > 0 && selectedBoms.length === page.length;
  const isIndeterminate =
    selectedBoms.length > 0 && selectedBoms.length < page.length;

  return (
    <div className="p-6">
      {isLoadingBoms && (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3">
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2"
              style={{ borderColor: colors.primary[500] }}
            ></div>
            <span
              className="font-medium"
              style={{ color: colors.text.secondary }}
            >
              Loading BOMs...
            </span>
          </div>
        </div>
      )}

      {!isLoadingBoms && dataBoms.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="rounded-full p-6 mb-4"
            style={{ backgroundColor: colors.gray[100] }}
          >
            <svg
              className="w-12 h-12"
              style={{ color: colors.gray[400] }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: colors.text.primary }}
          >
            No BOMs found
          </h3>
          <p className="max-w-md" style={{ color: colors.text.muted }}>
            Get started by creating your first Bill of Materials to manage your
            production processes.
          </p>
        </div>
      )}

      {!isLoadingBoms && dataBoms.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-6">
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  {dataBoms.length} BOM{dataBoms.length !== 1 ? "s" : ""} Found
                </h3>
                {/* {selectedBoms.length > 0 && (
                  <p
                    className="text-sm mt-1"
                    style={{ color: colors.text.secondary }}
                  >
                    {selectedBoms.length} selected
                  </p>
                )} */}
              </div>

              {/* Bulk Actions */}
              {/* {selectedBoms.length > 0 && (
                <div className="flex items-center gap-3">
                  {bulkApproveBomsHandler && (
                    <button
                      onClick={() => bulkApproveBomsHandler(selectedBoms)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Approve Selected ({selectedBoms.length})
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedBoms([])}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Clear Selection
                  </button>
                </div>
              )} */}
            </div>

            <div className="flex items-center gap-3">
              <span
                className="text-sm font-medium"
                style={{ color: colors.text.secondary }}
              >
                Show:
              </span>
              <select
                onChange={(e) => setPageSize(Number(e.target.value))}
                value={pageSize}
                className="px-3 py-2 text-sm rounded-lg border transition-colors"
                style={{
                  backgroundColor: colors.input.background,
                  borderColor: colors.border.light,
                  color: colors.text.primary,
                }}
              >
                {[5, 10, 20, 50, 100, 100000].map((size) => (
                  <option key={size} value={size}>
                    {size === 100000 ? "All" : size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Enhanced Table */}
          <div
            className="rounded-xl shadow-sm overflow-hidden"
            style={{
              backgroundColor: colors.background.card,
              border: `1px solid ${colors.border.light}`,
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: colors.table.header }}>
                  <tr
                    style={{ borderBottom: `1px solid ${colors.table.border}` }}
                  >
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{ color: colors.table.headerText }}
                    >
                      BOM ID
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{ color: colors.table.headerText }}
                    >
                      BOM Name
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{ color: colors.table.headerText }}
                    >
                      Parts Count
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{ color: colors.table.headerText }}
                    >
                      Total Cost
                    </th>
                    {/* {page?.original?.is_production_started === false ? null : ( */}
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{ color: colors.table.headerText }}
                    >
                      Update Finished Good Qty
                    </th>
                    {/* )} */}

                    <th
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{ color: colors.table.headerText }}
                    >
                      Created On
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{ color: colors.table.headerText }}
                    >
                      Last Updated
                    </th>
                    <th
                      className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap"
                      style={{ color: colors.table.headerText }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {page.map((row: any, index) => {
                    prepareRow(row);
                    return (
                      <tr
                        key={row.id}
                        className="transition-colors hover:shadow-sm"
                        style={{
                          backgroundColor:
                            index % 2 === 0
                              ? colors.background.card
                              : colors.table.stripe,
                          borderBottom: `1px solid ${colors.table.border}`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            colors.table.hover;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            index % 2 === 0
                              ? colors.background.card
                              : colors.table.stripe;
                        }}
                      >
                        <td
                          className="px-4 py-3 text-sm whitespace-nowrap font-mono"
                          style={{ color: colors.text.secondary }}
                          title={row.original._id}
                        >
                          {row.original.bom_id || "N/A"}
                        </td>
                        <td
                          className="px-4 py-3 text-sm font-medium whitespace-nowrap truncate max-w-xs"
                          style={{ color: colors.text.primary }}
                          title={row.original.bom_name}
                        >
                          {row.original.bom_name || "—"}
                        </td>
                        <td
                          className="px-4 py-3 text-sm whitespace-nowrap"
                          style={{ color: colors.text.secondary }}
                        >
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                            style={{
                              backgroundColor: colors.primary[100],
                              color: colors.primary[700],
                            }}
                          >
                            {row.original.parts_count || "0"} parts
                          </span>
                        </td>
                        <td
                          className="px-4 py-3 text-sm font-medium whitespace-nowrap"
                          style={{ color: colors.success[600] }}
                        >
                          {cookies?.role === "admin"
                            ? `₹${row.original.total_cost}`
                            : "₹*****"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              placeholder={
                                row.original.finished_good?.quantity?.toString() ||
                                "Qty"
                              }
                              value={editingQuantity[row.original._id] ?? ""}
                              onChange={(e) =>
                                handleQuantityChange(
                                  row.original._id,
                                  Number(e.target.value)
                                )
                              }
                              disabled={
                                row?.original?.is_production_started === false
                              }
                              className="w-20 px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{
                                backgroundColor:
                                  row?.original?.is_production_started === false
                                    ? colors.gray[100]
                                    : colors.input.background,
                                borderColor: colors.input.border,
                                color: colors.text.primary,
                              }}
                              onFocus={(e) => {
                                if (!e.currentTarget.disabled) {
                                  e.currentTarget.style.borderColor =
                                    colors.primary[500];
                                  e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.primary[100]}`;
                                }
                              }}
                              onBlur={(e) => {
                                e.currentTarget.style.borderColor =
                                  colors.input.border;
                                e.currentTarget.style.boxShadow = "none";
                              }}
                            />
                            <button
                              onClick={() =>
                                handleUpdateFinishedGoodQty(row.original._id)
                              }
                              disabled={
                                row?.original?.is_production_started ===
                                  false ||
                                updatingBomId === row.original._id ||
                                !editingQuantity[row.original._id]
                              }
                              className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{
                                backgroundColor: colors.primary[500],
                                color: colors.text.inverse,
                              }}
                              onMouseEnter={(e) => {
                                if (!e.currentTarget.disabled) {
                                  e.currentTarget.style.backgroundColor =
                                    colors.primary[600];
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!e.currentTarget.disabled) {
                                  e.currentTarget.style.backgroundColor =
                                    colors.primary[500];
                                }
                              }}
                            >
                              {updatingBomId === row.original._id ? (
                                <div className="flex items-center gap-1">
                                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-b-transparent border-white"></div>
                                </div>
                              ) : (
                                <SquarePen size={20} />
                              )}
                            </button>
                          </div>
                        </td>
                        <td
                          className="px-4 py-3 text-sm whitespace-nowrap"
                          style={{ color: colors.text.secondary }}
                        >
                          {row.original.createdAt
                            ? moment(row.original.createdAt).format(
                                "DD/MM/YYYY"
                              )
                            : "—"}
                        </td>
                        <td
                          className="px-4 py-3 text-sm whitespace-nowrap"
                          style={{ color: colors.text.secondary }}
                        >
                          {row.original.updatedAt
                            ? moment(row.original.updatedAt).format(
                                "DD/MM/YYYY"
                              )
                            : "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            {openBomDetailsDrawerHandler && (
                              <button
                                onClick={() =>
                                  openBomDetailsDrawerHandler(row.original._id)
                                }
                                className="p-2 rounded-lg transition-all duration-200 hover:shadow-md"
                                style={{
                                  color: colors.secondary[600],
                                  backgroundColor: colors.secondary[50],
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    colors.secondary[100];
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    colors.secondary[50];
                                }}
                                title="View BOM details"
                              >
                                <MdOutlineVisibility size={16} />
                              </button>
                            )}
                            {!row.original.is_production_started &&
                              openUpdateBomDrawerHandler && (
                                <button
                                  onClick={() =>
                                    openUpdateBomDrawerHandler(row.original._id)
                                  }
                                  className="p-2 rounded-lg transition-all duration-200 hover:shadow-md"
                                  style={{
                                    color: colors.primary[600],
                                    backgroundColor: colors.primary[50],
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                      colors.primary[100];
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                      colors.primary[50];
                                  }}
                                  title="Edit BOM"
                                >
                                  <MdEdit size={16} />
                                </button>
                              )}

                            {deleteBomHandler && cookies?.role === "admin" && (
                              <button
                                onClick={() => {
                                  setdeleteId(row.original._id);
                                  setshowDeletePage(true);
                                }}
                                className="p-2 rounded-lg transition-all duration-200 hover:shadow-md"
                                style={{
                                  color: colors.error[600],
                                  backgroundColor: colors.error[50],
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    colors.error[100];
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    colors.error[50];
                                }}
                                title="Delete BOM"
                              >
                                <MdDeleteOutline size={16} />
                              </button>
                            )}
                            {approveBomHandler && (
                              <button
                                onClick={() =>
                                  approveBomHandler(row.original._id)
                                }
                                className="p-2 rounded-lg transition-all duration-200 hover:shadow-md"
                                style={{
                                  color: colors.success[600],
                                  backgroundColor: colors.success[50],
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    colors.success[100];
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    colors.success[50];
                                }}
                                title="Approve BOM"
                              >
                                <FcApproval size={16} />
                              </button>
                            )}

                            {/* PDF Download Button */}
                            <button
                              disabled={isGeneratingPDF}
                              onClick={() =>
                                handlePDFDownload(
                                  row.original._id,
                                  row.original.bom_name
                                )
                              }
                              className="p-2 rounded-lg transition-all duration-200 hover:shadow-md disabled:opacity-50"
                              style={{
                                color: colors.warning[600],
                                backgroundColor: colors.warning[50],
                              }}
                              onMouseEnter={(e) => {
                                if (!e.currentTarget.disabled) {
                                  e.currentTarget.style.backgroundColor =
                                    colors.warning[100];
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!e.currentTarget.disabled) {
                                  e.currentTarget.style.backgroundColor =
                                    colors.warning[50];
                                }
                              }}
                              title={
                                isGeneratingPDF
                                  ? "Generating PDF..."
                                  : "Download BOM PDF"
                              }
                            >
                              {isGeneratingPDF ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent border-current"></div>
                              ) : (
                                <FaFilePdf size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Enhanced Pagination */}
          <div
            className="flex items-center justify-center px-6 py-4 border-t mt-4"
            style={{
              backgroundColor: colors.gray[50],
              borderColor: colors.border.light,
            }}
          >
            <div className="flex items-center gap-2">
              <button
                disabled={!canPreviousPage}
                onClick={previousPage}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                style={{
                  color: colors.text.primary,
                  backgroundColor: colors.background.card,
                  border: `1px solid ${colors.border.light}`,
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = colors.gray[50];
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor =
                      colors.background.card;
                  }
                }}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Previous
              </button>

              <span
                className="mx-4 text-sm"
                style={{ color: colors.text.secondary }}
              >
                Page {pageIndex + 1} of {pageCount}
              </span>

              <button
                disabled={!canNextPage}
                onClick={nextPage}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                style={{
                  color: colors.text.primary,
                  backgroundColor: colors.background.card,
                  border: `1px solid ${colors.border.light}`,
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = colors.gray[50];
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor =
                      colors.background.card;
                  }
                }}
              >
                Next
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Enhanced Delete Modal */}
      {showDeletePage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="w-full max-w-md mx-4 rounded-xl shadow-xl"
            style={{ backgroundColor: colors.background.card }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-lg font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  Confirm Deletion
                </h2>
              </div>

              <div className="mb-6">
                <div
                  className="rounded-lg p-4 mb-4"
                  style={{ backgroundColor: colors.error[50] }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <svg
                      className="w-6 h-6 flex-shrink-0"
                      style={{ color: colors.error[500] }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <div>
                      <p
                        className="font-medium text-center"
                        style={{ color: colors.error[800] }}
                      >
                        Delete BOM
                      </p>
                      <p
                        className="text-sm text-center"
                        style={{ color: colors.error[600] }}
                      >
                        This action cannot be undone. All BOM data will be
                        permanently removed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setshowDeletePage(false)}
                  className="flex-1 px-4 py-2 rounded-lg border transition-all duration-200"
                  style={{
                    borderColor: colors.border.medium,
                    color: colors.text.secondary,
                    backgroundColor: colors.background.card,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteBomHandler(deleteId);
                    setshowDeletePage(false);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg transition-all duration-200"
                  style={{
                    backgroundColor: colors.error[500],
                    color: colors.text.inverse,
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BOMTable;
